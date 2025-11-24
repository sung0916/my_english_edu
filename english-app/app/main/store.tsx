import apiClient from "@/api";
import { Pagination } from "@/components/common/Pagination";
import { crossPlatformAlert } from "@/utils/crossPlatformAlert";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";

// 한 페이지에 표시할 아이템 개수
const ITEMS_PER_PAGE = 8; 

// 상품 데이터 인터페이스
interface Item {
    id: number; // 또는 number, API 응답에 맞춰주세요.
    productName: string;
    price: number;
    imageUrl: string | null;
}

// API 응답 페이지 구조 인터페이스
interface Page<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
}

const Store = () => {
    const { width } = useWindowDimensions(); // 화면 크기 변경에 실시간으로 반응하는 hook
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [items, setItems] = useState<Item[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // 화면 너비에 따라 열 개수를 동적으로 계산 (반응형 처리)
    const numColumns = useMemo(() => {
        if (width < 600) return 2; // 모바일
        if (width < 900) return 3; // 태블릿
        return 4; // 웹 또는 넓은 화면
    }, [width]);

    // 아이템 목록을 불러오는 API 요청 함수
    const fetchItems = useCallback(async (page: number) => {
        // 페이지가 변경될 때만 로딩 상태를 true로 설정하여 전체 화면 로딩을 방지
        if (page === 1) setIsLoading(true);

        try {
            // API 엔드포인트는 실제 프로젝트에 맞게 수정해주세요 (예: /api/products/list)
            const response = await apiClient.get<Page<Item>>('/api/products/list', {
                params: {
                    page: page - 1, // 서버 API가 0-based 페이지네이션을 사용한다고 가정
                    size: ITEMS_PER_PAGE,
                    sort: 'id,desc',
                },
            });

            setItems(response.data.content);
            setTotalItems(response.data.totalElements);
        } catch (error) {
            console.error('상품 목록을 불러오는 데 실패했습니다.', error);
            crossPlatformAlert(
                '오류',
                '상품 목록을 불러오는 중 오류가 발생했습니다.'
            );
        } finally {
            setIsLoading(false);
        }
    }, []);

    // currentPage가 변경될 때마다 fetchItems 함수를 호출
    useEffect(() => {
        fetchItems(currentPage);
    }, [currentPage, fetchItems]);

    const handleItemPress = (id: number) => {
        router.push(`/main/store/${id}`);
    };

    // 각 상품 아이템을 렌더링하는 함수
    const renderItem = ({ item }: { item: Item }) => {
        // 아이템 너비 계산 (전체 너비 - 총 여백) / 열 개수
        const itemWidth = (width - 10 * (numColumns + 1)) / numColumns;
        const thumbnailUrl = item.imageUrl;

        return (
            <TouchableOpacity onPress={() => handleItemPress(item.id)} style={[styles.itemContainer, { width: itemWidth }]}>
                {   
                    thumbnailUrl ? (
                        <Image source={{ uri: thumbnailUrl }} style={styles.itemImage} />
                    ) : (
                        <View style={[styles.itemImage, styles.imagePlaceholder]} />
                    )
                }
                <View style={styles.itemTextContainer}>
                    <Text style={styles.itemTitle} numberOfLines={2}>
                        {item.productName}
                    </Text>
                    <Text style={styles.itemPrice}>
                        {item.price.toLocaleString('ko-KR')}원
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    // 초기 로딩 시 전체 화면에 로딩 인디케이터 표시
    if (isLoading && items.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={items}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                numColumns={numColumns}
                key={numColumns} // numColumns가 변경될 때 FlatList를 다시 렌더링하기 위한 key
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    !isLoading ? ( // 로딩 중이 아닐 때만 '없음' 메시지 표시
                        <Text style={styles.emptyText}>등록된 상품이 없습니다.</Text>
                    ) : null
                }
            />

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
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 5, // listContainer의 좌우 여백과 맞춤
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        paddingVertical: 10,
    },
    itemContainer: {
        margin: 5,
        backgroundColor: '#fff',
        borderRadius: 10,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#eee',
    },
    itemImage: {
        width: '100%',
        aspectRatio: 1, // 1:1 비율의 정사각형 이미지
        resizeMode: 'cover',
    },
    imagePlaceholder: {
        backgroundColor: '#e9ecef',
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemTextContainer: {
        padding: 10,
    },
    itemTitle: {
        fontSize: 14,
        color: '#333',
        marginBottom: 5,
        minHeight: 34, // 제목이 한 줄일 때도 높이를 유지
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: 'gray',
    },
    paginationContainer: {
        paddingVertical: 15,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
});

export default Store;
