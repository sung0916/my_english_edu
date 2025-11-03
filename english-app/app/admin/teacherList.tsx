import { useCallback, useEffect, useState } from "react";
import { SearchBox, SearchOption } from "../../components/common/SearchBox";
import { StyleSheet, View, FlatList, Text, Alert, TouchableOpacity, ActivityIndicator } from "react-native";
import { Pagination } from "../../components/common/Pagination";
import { Ionicons } from '@expo/vector-icons';
import apiClient from "../../api";
import crossPlatformAlert from "../../utils/crossPlatformAlert";

// --- Constants ---
const ITEMS_PER_PAGE = 10;

// --- TypeScript 인터페이스 정의 ---
// StudentList와 동일한 User 데이터 구조를 사용합니다.
interface Teacher {
    userId: number;
    username: string;
    loginId: string;
    tel: string;
    email: string;
    status: 'PENDING' | 'ACTIVE' | 'DELETED';
    role: 'STUDENT' | 'TEACHER' | 'ADMIN';
}

const TeacherList = () => {
    const teacherSearchOptions: SearchOption[] = [
        { value: 'userName', label: '이름' },
        { value: 'userId', label: '아이디' },
    ];

    const [isLoading, setIsLoading] = useState(true);
    const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);
    const [displayedTeachers, setDisplayedTeachers] = useState<Teacher[]>([]);
    const [currentPage, setCurrentPage] = useState(1);

    // --- 데이터 로딩 함수 (API 호출) ---
    const fetchTeachers = useCallback(async () => {
        setIsLoading(true);
        try {
            // [API 연동] GET /api/admin 호출하여 모든 사용자 정보 가져오기
            const response = await apiClient.get<Teacher[]>('/api/admin');
            
            // [핵심 로직] role이 'TEACHER'이고, status가 'ACTIVE' 또는 'DELETED'인 사용자만 필터링
            const filteredTeachers = response.data.filter(
                user => user.role === 'TEACHER' && (user.status === 'ACTIVE' || user.status === 'DELETED')
            );
            
            setAllTeachers(filteredTeachers);

        } catch (error) {
            console.error("선생님 목록을 불러오는 데 실패했습니다.", error);
            crossPlatformAlert("오류", "선생님 목록을 불러오는 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 컴포넌트 마운트 시 선생님 데이터를 불러옴
    useEffect(() => {
        fetchTeachers();
    }, [fetchTeachers]);

    // 클라이언트 사이드 페이지네이션
    useEffect(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        setDisplayedTeachers(allTeachers.slice(startIndex, endIndex));
    }, [allTeachers, currentPage]);

    // 검색 핸들러
    const handleTeacherSearch = (type: string, query: string) => {
        console.log(`선생님 검색 실행 >> 조건: ${type}, 검색어: ${query}`);
        // TODO: 백엔드에 검색 API가 추가되면 연동합니다.
    };

    // 삭제 핸들러
    const handleDelete = (userId: number, username: string) => {
        Alert.alert(
            "선생님 삭제",
            `'${username}' 선생님을 정말로 삭제(비활성화)하시겠습니까?`,
            [
                { text: "취소", style: "cancel" },
                {
                    text: "삭제",
                    onPress: async () => {
                        try {
                            // [API 연동] DELETE /api/admin/{userId} 호출
                            await apiClient.delete(`/api/admin/${userId}`);

                            // API 호출 성공 시, 클라이언트 상태를 즉시 업데이트
                            const updatedTeachers = allTeachers.map(teacher =>
                                teacher.userId === userId 
                                    ? { ...teacher, status: 'DELETED' as const } // 타입 에러 방지
                                    : teacher
                            );
                            setAllTeachers(updatedTeachers);

                            crossPlatformAlert("성공", "선생님이 삭제(비활성화)되었습니다.");
                        } catch (error) {
                            console.error("선생님 삭제 실패:", error);
                            crossPlatformAlert("오류", "선생님 삭제 처리 중 오류가 발생했습니다.");
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

    const renderTeacherRow = ({ item }: { item: Teacher }) => {
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
                options={teacherSearchOptions}
                onSearch={handleTeacherSearch}
            />

            <View style={styles.listContainer}>
                <FlatList
                    data={displayedTeachers}
                    renderItem={renderTeacherRow}
                    keyExtractor={(item) => item.userId.toString()}
                    ListHeaderComponent={renderTableHeader}
                    ListEmptyComponent={<Text style={styles.emptyText}>표시할 선생님이 없습니다.</Text>}
                />
            </View>
            
            {allTeachers.length > 0 && (
                <View style={styles.paginationContainer}>
                    <Pagination
                        currentPage={currentPage}
                        totalItems={allTeachers.length}
                        itemsPerPage={ITEMS_PER_PAGE}
                        onPageChange={(page) => setCurrentPage(page)}
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    safeArea: { 
        flex: 1, 
        backgroundColor: '#fff', 
        padding: 20 
    },
    listContainer: { 
        flex: 1, 
        marginTop: 16, 
        borderWidth: 1, 
        borderColor: '#dee2e6', 
        borderRadius: 4 
    },
    paginationContainer: { 
        paddingTop: 10 
    },
    tableHeader: { 
        flexDirection: 'row', 
        backgroundColor: '#f8f9fa', 
        borderBottomWidth: 2, 
        borderColor: '#dee2e6', 
        paddingHorizontal: 10, 
        paddingVertical: 12 
    },
    headerCell: { 
        fontWeight: 'bold', 
        textAlign: 'center' 
    },
    tableRow: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        borderBottomWidth: 1, 
        borderColor: '#dee2e6', 
        paddingHorizontal: 10, 
        minHeight: 50 
    },
    tableCell: { 
        textAlign: 'center', 
        paddingVertical: 10 
    },
    deletedText: { 
        color: '#868e96', 
        fontStyle: 'italic' 
    },
    emptyText: { 
        textAlign: 'center', 
        marginTop: 50, 
        fontSize: 16, 
        color: 'gray' 
    },
    loadingContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
});

export default TeacherList;