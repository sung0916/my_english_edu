import { useCallback, useEffect, useState } from "react";
import { SearchBox, SearchOption } from "../../components/common/SearchBox";
import { ActivityIndicator, Alert, FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Pagination } from "../../components/common/Pagination";
import apiClient from "../../api";
import { Ionicons } from "@expo/vector-icons";
import crossPlatformAlert from "../../utils/crossPlatformAlert";

const ITEMS_PER_PAGE = 10;

interface Student {
    userId: number;
    username: string;
    loginId: string;
    tel: string;
    email: string;
    status: 'ACTIVE' | 'DELETED';
    role: 'STUDENT' | 'TEACHER';
}

const StudentList = () => {
    const studentSearchOptions: SearchOption[] = [
        { value: 'userName', label: '이름' },
        { value: 'userId', label: '아이디' },
    ];

    const [isLoading, setIsLoading] = useState(true); // 데이터 로딩 상태
    const [allStudents, setAllStudents] = useState<Student[]>([]);
    const [displayedStudents, setDisplayedStudents] = useState<Student[]>([]);
    const [currentPage, setCurrentPage] = useState(1);

    // --- 데이터 로딩 함수 (API 호출) ---
    const fetchStudents = useCallback(async () => {
        setIsLoading(true);
        try {
            // [API 연동] GET /api/admin 호출하여 모든 사용자 정보 가져오기
            const response = await apiClient.get<Student[]>('/api/admin');
            
            // 요구사항: ACTIVE, DELETED 상태의 학생만 필터링
            const filteredStudents = response.data.filter(
                user => user.role === 'STUDENT' && (user.status === 'ACTIVE' || user.status === 'DELETED')
            );
            
            setAllStudents(filteredStudents);

        } catch (error) {
            console.error("학생 목록을 불러오는 데 실패했습니다.", error);
            crossPlatformAlert("오류", "학생 목록을 불러오는 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false); // 로딩 종료
        }
    }, []);

    // 컴포넌트 마운트 시 학생 데이터를 불러옴
    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    // 클라이언트 사이드 페이지네이션
    useEffect(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        setDisplayedStudents(allStudents.slice(startIndex, endIndex));
    }, [allStudents, currentPage]);

    // 검색 핸들러
    const handleStudentSearch = (type: string, query: string) => {
        console.log(`학생 검색 실행 >> 조건: ${type}, 검색어: ${query}`);
        // TODO: 백엔드에 검색 API가 추가되면 연동합니다.
        // 현재는 클라이언트 사이드 검색으로 구현 가능합니다.
        // 예: const results = allStudents.filter(s => s[type].includes(query));
    };

    // 삭제 핸들러
    const handleDelete = (userId: number, username: string) => {
        Alert.alert(
            "학생 삭제",
            `'${username}' 학생을 정말로 삭제(비활성화)하시겠습니까?`,
            [
                { text: "취소", style: "cancel" },
                {
                    text: "삭제",
                    onPress: async () => {
                        try {
                            // [API 연동] DELETE /api/admin/{userId} 호출
                            await apiClient.delete(`/api/admin/${userId}`);

                            // API 호출 성공 시, 클라이언트 상태를 즉시 업데이트
                            const updatedStudents = allStudents.map(student =>
                                student.userId === userId ? { ...student, status: 'DELETED' as const } : student
                            );
                            setAllStudents(updatedStudents);

                            crossPlatformAlert("성공", "학생이 삭제(비활성화)되었습니다.");
                        } catch (error) {
                            console.error("학생 삭제 실패:", error);
                            crossPlatformAlert("오류", "학생 삭제 처리 중 오류가 발생했습니다.");
                        }
                    },
                    style: "destructive",
                },
            ]
        );
    };

    // --- 렌더링 함수 ---

    const renderTableHeader = () => (
        <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, { flex: 1.5 }]}>이름</Text>
            <Text style={[styles.headerCell, { flex: 2 }]}>아이디</Text>
            <Text style={[styles.headerCell, { flex: 2.5 }]}>연락처</Text>
            <Text style={[styles.headerCell, { flex: 3 }]}>이메일</Text>
            <Text style={[styles.headerCell, { flex: 1.2 }]}>삭제</Text>
        </View>
    );

    const renderStudentRow = ({ item }: { item: Student }) => {
        const isDeleted = item.status === 'DELETED';

        return (
            <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 1.5 }]}>{item.username}</Text>
                <Text style={[styles.tableCell, { flex: 2 }]}>{isDeleted ? '-' : item.loginId}</Text>
                <Text style={[styles.tableCell, { flex: 2.5 }]}>{isDeleted ? '-' : item.tel}</Text>
                <Text style={[styles.tableCell, { flex: 3 }]}>{isDeleted ? '-' : item.email}</Text>
                <View style={[styles.tableCell, { flex: 1.2, alignItems: 'center' }]}>
                    {isDeleted ? (
                        <Text style={styles.deletedText}>삭제됨</Text>
                    ) : (
                        <TouchableOpacity onPress={() => handleDelete(item.userId, item.username)}>
                            <Ionicons name="trash-outline" size={22} color="red" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    // 로딩 중일 때 보여줄 UI
    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <View style={styles.safeArea}>
            <SearchBox
                options={studentSearchOptions}
                onSearch={handleStudentSearch}
            />

            <View style={styles.listContainer}>
                <FlatList
                    data={displayedStudents}
                    renderItem={renderStudentRow}
                    keyExtractor={(item) => item.userId.toString()}
                    ListHeaderComponent={renderTableHeader}
                    ListEmptyComponent={<Text style={styles.emptyText}>표시할 학생이 없습니다.</Text>}
                />
            </View>
            
            {allStudents.length > 0 && (
                <View style={styles.paginationContainer}>
                    <Pagination
                        currentPage={currentPage}
                        totalItems={allStudents.length}
                        itemsPerPage={ITEMS_PER_PAGE}
                        onPageChange={(page) => setCurrentPage(page)}
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    // (이전과 동일한 스타일)
    safeArea: { flex: 1, backgroundColor: '#fff', padding: 20 },
    listContainer: { flex: 1, marginTop: 16, borderWidth: 1, borderColor: '#dee2e6', borderRadius: 4 },
    paginationContainer: { paddingTop: 10 },
    tableHeader: { flexDirection: 'row', backgroundColor: '#f8f9fa', borderBottomWidth: 2, borderColor: '#dee2e6', paddingHorizontal: 10, paddingVertical: 12 },
    headerCell: { fontWeight: 'bold', textAlign: 'center' },
    tableRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderColor: '#dee2e6', paddingHorizontal: 10, minHeight: 50 },
    tableCell: { textAlign: 'center', paddingVertical: 10 },
    deletedText: { color: '#868e96', fontStyle: 'italic' },
    emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: 'gray' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' }, // 로딩 컨테이너 스타일 추가
});

export default StudentList;