import { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, Platform, StyleSheet, Text, View } from "react-native";
import { Pagination } from "../../components/common/Pagination";
import apiClient from "../../api";
import { Picker } from "@react-native-picker/picker";
import PermitCustomButton from "../../components/common/PermitButtonProps";
import RefuseCustomButton from "../../components/common/RefuseButtonProps";

const ITEMS_PER_PAGE = 5;

// [수정] 백엔드 Enum과 값을 맞추기 위해 문자열 리터럴 타입으로 변경
type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN';

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

    const fetchPendingUsers = useCallback(async () => {
        try {
            const response = await apiClient.get<PendingUser[]>('/api/admin/pending');
            setAllPendingUsers(response.data);

            const initialRoles: { [key: number]: UserRole } = {};
            response.data.forEach(user => {
                initialRoles[user.userId] = 'STUDENT'; // 기본값
            });
            setSelectedRoles(initialRoles);

        } catch (error) {
            console.error("승인 대기 목록을 불러오는 데 실패했습니다.", error);
            // 인터셉터에서 에러를 처리하므로, 중복 Alert을 방지하기 위해 주석 처리하거나 제거할 수 있습니다.
            // Alert.alert("오류", "대기 목록을 불러오는 중 오류가 발생했습니다.");
        }
    }, []);

    useEffect(() => {
        fetchPendingUsers();
    }, [fetchPendingUsers]);

    useEffect(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        setDisplayedUsers(allPendingUsers.slice(startIndex, endIndex));
    }, [allPendingUsers, currentPage]);

    const handleRoleChange = (userId: number, role: UserRole) => {
        setSelectedRoles(prevRoles => ({
            ...prevRoles,
            [userId]: role,
        }));
    };

    const handleApprove = async (userId: number) => {
        const roleToApprove = selectedRoles[userId];
        if (!roleToApprove) {
            Alert.alert("알림", "역할을 선택해주세요.");
            return;
        }
        try {
            await apiClient.patch(`/api/admin/${userId}/approve`, { role: roleToApprove });
            Alert.alert("성공", "사용자 승인이 완료되었습니다.");
            setAllPendingUsers(prevUsers => prevUsers.filter(user => user.userId !== userId));
        } catch (error) {
            console.error("사용자 승인 실패:", error);
            Alert.alert("오류", "사용자 승인 중 오류가 발생했습니다.");
        }
    };

    const handleRemove = async (userId: number) => {
        try {
            await apiClient.delete(`/api/admin/${userId}`);
            Alert.alert("성공", "사용자가 제거(비활성화)되었습니다.");
            setAllPendingUsers(prevUsers => prevUsers.filter(user => user.userId !== userId));
        } catch (error) {
            console.error("사용자 제거 실패:", error);
            Alert.alert("오류", "사용자 제거 중 오류가 발생했습니다.");
        }
    };

    // --- 렌더링 ---
    const renderUserRow = ({ item }: { item: PendingUser }) => (
        <View style={styles.tableRow}>
            {/* [스타일 수정] flex 비율을 StudentList와 유사하게 조정 */}
            <Text style={[styles.tableCell, { flex: 1.5 }]}>{item.username}</Text>
            <Text style={[styles.tableCell, { flex: 2 }]}>{item.loginId}</Text>
            <Text style={[styles.tableCell, { flex: 2.5 }]}>{item.tel}</Text>

            {/* [스타일 수정] 역할 선택 셀 */}
            <View style={[styles.tableCell, { flex: 2, alignItems: 'center' }]}>
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

            {/* [스타일 수정] 허가 상태 버튼 셀 */}
            <View style={[styles.tableCell, styles.actionCell, { flex: 3 }]}>
                <PermitCustomButton 
                    title="허가" 
                    onPress={() => handleApprove(item.userId)}
                    style={{ width: 75, padding: 10, marginRight: 7 }} 
                />
                <RefuseCustomButton 
                    title="제거" 
                    onPress={() => handleRemove(item.userId)} 
                    style={{ width: 75, padding: 10, marginLeft: 7 }}    
                />
            </View>
        </View>
    );

    const renderTableHeader = () => (
        <View style={styles.tableHeader}>
            {/* [스타일 수정] flex 비율을 StudentList와 유사하게 조정 */}
            <Text style={[styles.headerCell, { flex: 1.5 }]}>이름</Text>
            <Text style={[styles.headerCell, { flex: 2 }]}>아이디</Text>
            <Text style={[styles.headerCell, { flex: 2.5 }]}>연락처</Text>
            <Text style={[styles.headerCell, { flex: 2 }]}>역할</Text>
            <Text style={[styles.headerCell, { flex: 3 }]}>허가 상태</Text>
        </View>
    );

    return (
        <View style={styles.safeArea}>
            <FlatList
                style={styles.listContainer}
                data={displayedUsers}
                renderItem={renderUserRow}
                keyExtractor={(item) => item.userId.toString()}
                ListHeaderComponent={renderTableHeader}
                ListEmptyComponent={<Text style={styles.emptyText}>승인을 기다리는 사용자가 없습니다.</Text>}
            />

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
        minWidth: 768,
    },
    listContainer: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#dee2e6',
        borderRadius: 4,
    },
    paginationContainer: {
        paddingTop: 10,
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
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: '#dee2e6',
        paddingHorizontal: 10,
        minHeight: 60,
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
        // [스타일 수정] 고정 너비를 제거하고 부모의 flex에 맞춰지도록 함
        width: '100%', 
        maxWidth: 150, // 너무 넓어지지 않도록 최대 너비 설정
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