import { crossPlatformAlert } from "@/utils/crossPlatformAlert";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import apiClient from "../../api";
import { Pagination } from "../../components/common/Pagination";
import { SearchBox, SearchOption } from "../../components/common/SearchBox";

const ITEMS_PER_PAGE = 10;

// 인터페이스 이름을 좀 더 범용적인 'Post'로 변경
interface Post {
    announcementId: number; // API 응답 DTO의 필드명은 그대로 유지
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

const Board = () => {
    const router = useRouter();
    // 검색 옵션은 그대로 유지
    const boardSearchOptions: SearchOption[] = [
        { value: 'title', label: '제목' },
        { value: 'content', label: '내용' },
    ];

    const [isLoading, setIsLoading] = useState(true);
    // 상태 변수 이름을 posts로 변경
    const [posts, setPosts] = useState<Post[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // 함수 이름 및 에러 메시지 텍스트를 '게시글'로 수정
    const fetchPosts = useCallback(async (page: number) => {
        setIsLoading(true);
        try {
            // API 엔드포인트는 기존의 공지사항 목록을 그대로 사용
            const response = await apiClient.get<Page<Post>>('/api/announcements/list', {
                params: {
                    page: page - 1,
                    size: ITEMS_PER_PAGE,
                    sort: 'id,desc',
                }
            });
            
            setPosts(response.data.content);
            setTotalItems(response.data.totalElements);

        } catch (error) {
            console.error("게시글 목록을 불러오는 데 실패했습니다.", error);
            crossPlatformAlert("오류", "게시글 목록을 불러오는 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPosts(currentPage);
    }, [currentPage, fetchPosts]);

    const handleSearch = (type: string, query: string) => {
        console.log(`게시글 검색 실행 >> 조건: ${type}, 검색어: ${query}`);
        // TODO: 검색 API 연동 로직 구현
    };

    const handleRowPress = (id: number) => {
        router.push(`/main/board/${id}`);
    };

    // --- 삭제된 부분 ---
    // handleDelete 함수 제거

    // 테이블 헤더 렌더링 함수 ('관리' 컬럼 제거)
    const renderTableHeader = () => (
        <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, { flex: 1 }]}>번호</Text>
            <Text style={[styles.headerCell, { flex: 4 }]}>제목</Text>
            {/* <Text style={[styles.headerCell, { flex: 1.5 }]}>작성자</Text> */}
            <Text style={[styles.headerCell, { flex: 2 }]}>작성일</Text>
            <Text style={[styles.headerCell, { flex: 1 }]}>조회수</Text>
            {/* '관리' 헤더 셀 제거 */}
        </View>
    );

    // 테이블 행 렌더링 함수 ('관리' 아이콘 제거)
    const renderBoardRow = ({ item }: { item: Post }) => (
        <TouchableOpacity style={styles.tableRow} onPress={() => handleRowPress(item.announcementId)}>
            <Text style={[styles.tableCell, { flex: 1 }]}>{item.announcementId}</Text>
            <Text style={[styles.tableCell, { flex: 4, textAlign: 'left', paddingLeft: 10 }]}>{item.title}</Text>
            {/* <Text style={[styles.tableCell, { flex: 1.5 }]}>{item.authorName}</Text> */}
            <Text style={[styles.tableCell, { flex: 2 }]}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            <Text style={[styles.tableCell, { flex: 1 }]}>{item.viewCount}</Text>
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
            {/* 검색창은 그대로 유지 */}
            <SearchBox
                options={boardSearchOptions}
                onSearch={handleSearch}
            />

            <View style={styles.listContainer}>
                <FlatList
                    data={posts}
                    renderItem={renderBoardRow}
                    keyExtractor={(item) => item.announcementId.toString()}
                    ListHeaderComponent={renderTableHeader}
                    ListEmptyComponent={<Text style={styles.emptyText}>등록된 게시글이 없습니다.</Text>}
                />
            </View>

            {/* --- 삭제된 부분 --- */}
            {/* 글쓰기 버튼을 포함한 bottomContainer View 제거 */}
            
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

// 불필요한 스타일(bottomContainer, writeButton 등) 제거
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
    paginationContainer: { 
        paddingTop: 10,
        alignItems: 'center'
     },
});

export default Board;
