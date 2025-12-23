import { crossPlatformAlert } from "@/utils/crossPlatformAlert";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import apiClient from "../../api";
import { Pagination } from "../../components/common/Pagination";
import { SearchBox, SearchOption } from "../../components/common/SearchBox";

const ITEMS_PER_PAGE = 10;

interface Announcement {
    announcementId: number;
    title: string;
    authorName: string;
    viewCount: number;
    createdAt: string;
}

interface Page<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
}

const BoardList = () => {
    const router = useRouter();

    const boardSearchOptions: SearchOption[] = [
        { value: 'title', label: '제목' },
        { value: 'content', label: '내용' },
    ];

    const [isLoading, setIsLoading] = useState(true);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const fetchAnnouncements = useCallback(async (page: number) => {
        setIsLoading(true);
        try {
            const response = await apiClient.get<Page<Announcement>>('/api/announcements/list', {
                params: {
                    page: page - 1,
                    size: ITEMS_PER_PAGE,
                    sort: 'id,desc',
                }
            });
            
            setAnnouncements(response.data.content);
            setTotalItems(response.data.totalElements);

        } catch (error) {
            console.error("공지사항 목록을 불러오는 데 실패했습니다.", error);
            // [적용됨] 오류 발생 시 crossPlatformAlert 사용
            crossPlatformAlert("오류", "공지사항 목록을 불러오는 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAnnouncements(currentPage);
    }, [currentPage, fetchAnnouncements]);

    const handleSearch = (type: string, query: string) => {
        console.log(`게시글 검색 실행 >> 조건: ${type}, 검색어: ${query}`);
    };

    const handleRowPress = (id: number) => {
        router.push(`/main/board/${id}`);
    };

    const handleDelete = (id: number, title: string) => {
        // 1. '확인/취소' 버튼이 있는 확인(Confirm) 창 -> React Native의 Alert.alert 사용 (정상)
        Alert.alert(
            "공지사항 삭제",
            `'${title}' 공지사항을 정말로 삭제하시겠습니까?`,
            [
                { text: "취소", style: "cancel" },
                {
                    text: "삭제",
                    onPress: async () => {
                        try {
                            await apiClient.delete(`/api/announcements/${id}`);

                            // 2. 작업 완료 후 결과만 알려주는 알림(Notification) 창 -> crossPlatformAlert 사용 (정상)
                            crossPlatformAlert("성공", "공지사항이 삭제되었습니다.");
                            
                            fetchAnnouncements(currentPage); 
                        } catch (error) {
                            console.error("공지사항 삭제 실패:", error);
                            // [적용됨] 오류 발생 시 crossPlatformAlert 사용
                            crossPlatformAlert("오류", "공지사항 삭제 처리 중 오류가 발생했습니다.");
                        }
                    },
                    style: "destructive",
                },
            ]
        );
    };

    const renderTableHeader = () => (
        <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, { flex: 1 }]}>번호</Text>
            <Text style={[styles.headerCell, { flex: 4 }]}>제목</Text>
            <Text style={[styles.headerCell, { flex: 1.5 }]}>작성자</Text>
            <Text style={[styles.headerCell, { flex: 2 }]}>작성일</Text>
            <Text style={[styles.headerCell, { flex: 1 }]}>조회수</Text>
            <Text style={[styles.headerCell, { flex: 1.5 }]}>관리</Text>
        </View>
    );

    const renderBoardRow = ({ item }: { item: Announcement }) => (
        <TouchableOpacity style={styles.tableRow} onPress={() => handleRowPress(item.announcementId)}>
            <Text style={[styles.tableCell, { flex: 1 }]}>{item.announcementId}</Text>
            <Text style={[styles.tableCell, { flex: 4, textAlign: 'left', paddingLeft: 10 }]}>{item.title}</Text>
            <Text style={[styles.tableCell, { flex: 1.5 }]}>{item.authorName}</Text>
            <Text style={[styles.tableCell, { flex: 2 }]}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            <Text style={[styles.tableCell, { flex: 1 }]}>{item.viewCount}</Text>
            <View style={[styles.tableCell, { flex: 1.5, flexDirection: 'row', justifyContent: 'center' }]}>
                {/* 삭제 버튼은 자체 TouchableOpacity가 있어 독립적으로 동작 */}
                <TouchableOpacity onPress={() => handleDelete(item.announcementId, item.title)}>
                    <Ionicons name="trash-outline" size={22} color="red" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
    
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
                options={boardSearchOptions}
                onSearch={handleSearch}
            />

            <View style={styles.listContainer}>
                <FlatList
                    data={announcements}
                    renderItem={renderBoardRow}
                    keyExtractor={(item) => item.announcementId.toString()}
                    ListHeaderComponent={renderTableHeader}
                    ListEmptyComponent={<Text style={styles.emptyText}>등록된 공지사항이 없습니다.</Text>}
                />
            </View>

            <View style={styles.bottomContainer}>
                <View style={{ flex: 1 }} />
                <TouchableOpacity 
                    style={styles.writeButton} 
                    onPress={() => router.push('/admin/write')}
                >
                    <Ionicons name="pencil" size={16} color="white" />
                    <Text style={styles.writeButtonText}>글쓰기</Text>
                </TouchableOpacity>
            </View>
            
            {totalItems > 0 && (
                <View style={styles.paginationContainer}>
                    <Pagination
                        currentPage={currentPage}
                        totalItems={totalItems}
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
        paddingVertical: 10, 
        color: '#495057' 
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
    bottomContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 10,
        minHeight: 40,
    },
    writeButton: {
        flexDirection: 'row',
        backgroundColor: '#0f83ffff',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    writeButtonText: {
        color: 'white',
        fontWeight: 'bold',
        marginLeft: 5,
    },
    paginationContainer: { 
        paddingTop: 10,
        alignItems: 'center'
     },
});

export default BoardList;
