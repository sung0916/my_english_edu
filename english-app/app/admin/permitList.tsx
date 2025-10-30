import { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, Platform, StyleSheet, Text, View } from "react-native";
import { Pagination } from "../../components/common/Pagination";
import apiClient from "../../api";
import { Picker } from "@react-native-picker/picker";
import PermitCustomButton from "../../components/common/PermitButtonProps";
import RefuseCustomButton from "../../components/common/RefuseButtonProps";

const ITEMS_PER_PAGE = 5;

enum UserRole {
    STUDENT = '학생',
    TEACHER = '선생님',
    ADMIN = '관리자'
}

interface PendingUser {
    userId: number;
    username: string;
    loginId: string;
    tel: string;
    role: UserRole | null;
    status: string;
}

const PermitList = () => {

    const [allPendingUsers, setAllPendingUsers] = useState<PendingUser[]>([]);
    const [displayedUsers, setDisplayedUsers] = useState<PendingUser[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRoles, setSelectedRoles] = useState<{ [key: number]: UserRole }>({});

    // --- 데이터 로딩 함수 (API 호출) ---
    const fetchPendingUsers = useCallback(async () => {
        try {
            // [API 연동] 승인 대기 중인 사용자 목록
            const response = await apiClient.get<PendingUser[]>('/api/admin/pending');
            setAllPendingUsers(response.data);

            // 불러온 사용자에 대해 기본 역할을 'STUDENT'로 설정
            const initialRoles: { [key: number]: UserRole } = {};
            response.data.forEach(user => {
                initialRoles[user.userId] = UserRole.STUDENT; // 기본값
            });
            setSelectedRoles(initialRoles);

        } catch (error) {
            console.error("승인 대기 목록을 불러오는 데 실패했습니다.", error);
            Alert.alert("오류", "대기 목록을 불러오는 중 오류가 발생했습니다.");
        }
    }, []);

    // 컴포넌트가 처음 마운트될 때 API를 호출
    useEffect(() => {
        fetchPendingUsers();
    }, [fetchPendingUsers]);

    // 전체 사용자 목록이나 현재 페이지가 변경될 때, 해당 페이지에 보여줄 목록을 계산(클라이언트 사이드 페이지네이션)
    useEffect(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        setDisplayedUsers(allPendingUsers.slice(startIndex, endIndex));
    }, [allPendingUsers, currentPage]);

    // 역할 변경 핸들러
    const handleRoleChange = (userId: number, role: UserRole) => {
        setSelectedRoles(prevRoles => ({
            ...prevRoles,
            [userId]: role,
        }));
    };

    // '허가' 버튼 핸들러
    const handleApprove = async (userId: number) => {
        const roleToApprove = selectedRoles[userId];
        try {
            // [API 연동] 서버에 승인 요청을 보냅니다.
            await apiClient.patch(`/api/admin/${userId}/approve`, { role: roleToApprove });
            Alert.alert("성공", "사용자 승인이 완료되었습니다.");

            // 성공 시, 전체 목록에서 해당 사용자를 즉시 제거하여 UI를 업데이트합니다.
            setAllPendingUsers(prevUsers => prevUsers.filter(user => user.userId !== userId));

        } catch (error) {
            console.error("사용자 승인 실패:", error);
            Alert.alert("오류", "사용자 승인 중 오류가 발생했습니다.");
        }
    };

    // '제거' 버튼 핸들러
    const handleRemove = async (userId: number) => {
        try {
            // [API 연동] 서버에 사용자 삭제(비활성화) 요청을 보냅니다.
            await apiClient.delete(`/api/admin/${userId}`);
            Alert.alert("성공", "사용자가 제거(비활성화)되었습니다.");

            // 성공 시, 전체 목록에서 해당 사용자를 즉시 제거하여 UI를 업데이트합니다.
            setAllPendingUsers(prevUsers => prevUsers.filter(user => user.userId !== userId));

        } catch (error) {
            console.error("사용자 제거 실패:", error);
            Alert.alert("오류", "사용자 제거 중 오류가 발생했습니다.");
        }
    };

    // --- 렌더링 ---
    // 각 사용자 항목을 렌더링하는 함수
    const renderUserRow = ({ item }: { item: PendingUser }) => (
        <View style={styles.tableRow}>
            {/* 각 셀(cell)은 flex 비율로 너비를 조절합니다. */}
            <Text style={[styles.tableCell, { flex: 1.5 }]}>{item.username}</Text>
            <Text style={[styles.tableCell, { flex: 1.5 }]}>{item.loginId}</Text>
            <Text style={[styles.tableCell, { flex: 2 }]}>{item.tel}</Text>

            {/* 역할 선택 셀 */}
            <View style={[styles.tableCell, { flex: 1 }]}>
                {Platform.OS === 'web' ? (
                    <select
                        value={selectedRoles[item.userId] || ''}
                        onChange={(e) => handleRoleChange(item.userId, e.target.value as UserRole)}
                        style={styles.pickerWeb}
                    >
                        <option value="STUDENT">STUDENT</option>
                        <option value="TEACHER">TEACHER</option>
                        <option value="ADMIN">ADMIN</option>
                    </select>
                ) : (
                    <Picker
                        selectedValue={selectedRoles[item.userId]}
                        onValueChange={(value) => handleRoleChange(item.userId, value)}
                        style={styles.pickerNative}
                    >
                        <Picker.Item label="STUDENT" value="STUDENT" />
                        <Picker.Item label="TEACHER" value="TEACHER" />
                        <Picker.Item label="ADMIN" value="ADMIN" />
                    </Picker>
                )}
            </View>

            {/* 허가 상태 버튼 셀 */}
            <View style={[styles.tableCell, styles.actionCell, { flex: 2.5 }]}>
                {/* [적용] 버튼을 flex: 1 스타일을 가진 View로 감쌉니다. */}
                <View style={{ flex: 1, marginRight: 4, marginLeft: 10, minWidth: 80, maxWidth: 100 }}>
                    <PermitCustomButton title="허가" onPress={() => handleApprove(item.userId)} />
                </View>
                <View style={{ flex: 1, marginLeft: 4, minWidth: 80, maxWidth: 100 }}>
                    <RefuseCustomButton title="제거" onPress={() => handleRemove(item.userId)} />
                </View>
            </View>
        </View>
    );

    // [추가] 테이블 헤더를 별도의 컴포넌트로 분리
    const renderTableHeader = () => (
        <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, { flex: 1.5 }]}>이름</Text>
            <Text style={[styles.headerCell, { flex: 1.5 }]}>아이디</Text>
            <Text style={[styles.headerCell, { flex: 2 }]}>연락처</Text>
            <Text style={[styles.headerCell, { flex: 1 }]}>역할</Text>
            <Text style={[styles.headerCell, { flex: 2.5 }]}>허가 상태</Text>
        </View>
    );

    return (
        // 1. 최상위 View가 화면 전체를 차지합니다.
        <View style={styles.safeArea}>
            {/* 
              2. FlatList를 담는 컨테이너가 flex: 1을 가져
                 페이지네이션을 제외한 모든 남은 공간을 차지합니다.
            */}
            <FlatList
                style={styles.listContainer}
                data={displayedUsers}
                renderItem={renderUserRow}
                keyExtractor={(item) => item.userId.toString()}
                ListHeaderComponent={renderTableHeader}
                ListEmptyComponent={<Text style={styles.emptyText}>승인을 기다리는 사용자가 없습니다.</Text>}
            />

            {/* 3. 페이지네이션은 고정 높이를 가지며 화면 하단에 위치합니다. */}
            {allPendingUsers.length > 0 && (
                <View style={styles.paginationContainer}>
                    <Pagination
                        currentPage={currentPage}
                        totalItems={allPendingUsers.length}
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
        padding: 20,
        minWidth: 900,
    },
    listContainer: {
        flex: 1, // FlatList가 남은 공간을 모두 차지
        borderWidth: 1,
        borderColor: '#dee2e6',
        borderRadius: 4,
    },
    paginationContainer: {
        paddingTop: 10, // 목록과 페이지네이션 사이 간격
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f8f9fa',
        borderBottomWidth: 2,
        borderColor: '#dee2e6',
        paddingHorizontal: 10,
        paddingVertical: 12,
    },
    headerCell: {
        fontWeight: 'bold',
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        alignItems: 'center', // 셀 내용 수직 중앙 정렬
        borderBottomWidth: 1,
        borderColor: '#dee2e6',
        paddingHorizontal: 10,
        minHeight: 60, // 행의 최소 높이 지정
    },
    tableCell: {
        textAlign: 'center',
        paddingVertical: 10,
    },
    actionCell: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pickerWeb: {
        padding: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        backgroundColor: 'white',
        width: 100,
    },
    pickerNative: {
        width: '100%',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: 'gray',
        padding: 20,
    },
});

export default PermitList;