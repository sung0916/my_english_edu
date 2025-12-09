import { Pagination } from "@/components/common/Pagination"; // Store와 동일한 경로라고 가정
import { crossPlatformAlert } from "@/utils/crossPlatformAlert"; // Store와 동일한 경로라고 가정
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Image, Platform, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";

// 한 페이지에 표시할 아이템 개수 (요청하신 대로 4개)
const ITEMS_PER_PAGE = 4;

// 게임 데이터 인터페이스
interface GameItem {
    id: number;
    title: string;       // 게임 이름 (productName 대응)
    description: string; // 게임 설명 (price 대응)
    imageUrl: string | null;
    route: string;       // 이동할 경로
    isReady: boolean;    // 개발 완료 여부
}

// 가상의 게임 데이터 (나중에 API로 대체 가능)
const MOCK_GAMES: GameItem[] = [
    {
        id: 1,
        title: "Mystery Word Cards",
        description: "단어 맞추기 게임",
        imageUrl: null, // 나중에 썸네일 URL 넣으세요
        route: "/game/mysteryCards",
        isReady: true
    },
    {
        id: 2,
        title: "Falling Words",
        description: "미스테리 카드 뒤집기",
        imageUrl: null,
        route: "/game/fallingWords",
        isReady: true
    },
    {
        id: 3,
        title: "Maze Adventure",
        description: "미로 탐험가",
        imageUrl: null,
        route: "/game/mazeAdventure",
        isReady: true
    },
    {
        id: 4,
        title: "Word Puzzle",
        description: "가로세로 낱말퀴즈 (준비중)",
        imageUrl: null,
        route: "/game/word-puzzle",
        isReady: false
    },
];

const Games = () => {
    const { width } = useWindowDimensions();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [items, setItems] = useState<GameItem[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // 화면 너비에 따라 열 개수를 동적으로 계산 (Store와 동일)
    const numColumns = useMemo(() => {
        if (width < 600) return 2; // 모바일
        if (width < 900) return 3; // 태블릿
        return 4; // 웹 또는 넓은 화면
    }, [width]);

    // 게임 목록을 불러오는 함수 (API 호출 흉내)
    const fetchItems = useCallback(async (page: number) => {
        if (page === 1) setIsLoading(true);

        try {
            // 실제 API가 있다면 여기서 axios/apiClient 호출
            // 지금은 MOCK_GAMES 배열을 잘라서 페이지네이션 흉내

            // 0.5초 딜레이 (로딩 UI 확인용)
            await new Promise(resolve => setTimeout(resolve, 500));

            const startIndex = (page - 1) * ITEMS_PER_PAGE;
            const endIndex = startIndex + ITEMS_PER_PAGE;
            const slicedData = MOCK_GAMES.slice(startIndex, endIndex);

            setItems(slicedData);
            setTotalItems(MOCK_GAMES.length);

        } catch (error) {
            console.error('게임 목록을 불러오는 데 실패했습니다.', error);
            crossPlatformAlert('오류', '게임 목록을 불러오는 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchItems(currentPage);
    }, [currentPage, fetchItems]);

    // 게임 클릭 핸들러
    const handleItemPress = (game: GameItem) => {
        if (!game.isReady) {
            crossPlatformAlert("알림", "아직 준비 중인 게임입니다.");
            return;
        }

        if (Platform.OS === 'web') {  // 웹 환경에서 새 창으로 열기
            // 창 크기 및 위치 설정
            const width = 1200;  // 게임 창 너비
            const height = 800;  // 게임 창 높이
            const left = (window.screen.width - width) / 2;
            const top = (window.screen.height) / 2;

            // 현재 도메인 + 게임 경로 조합 (window.location.origin - 현재 사이트 주소 (http://localhost:8081))
            const url = `${window.location.origin}${game.route}`;

            // window.open 실행, 두번째 인자(`game_${game.id}로 설정하면 같은 게임은 중복해서 열리지 않고 포커스만 이동됨)
            window.open(
                url,
                `game_window_${game.id}`,  // 창 이름 (고유 ID를 써야 게임 별로 새창이 열림)
                `width=${width}, height=${height}, top=${top}, left=${left}, resizable=yes, scrollbars=no, status=no, menubar=no`
            );

        } else {  // 모바일 환경에서는 페이지 이동
            router.push(game.route as any);
        }
    };

    const renderItem = ({ item }: { item: GameItem }) => {
        // 아이템 너비 계산 (Store와 동일 로직)
        const itemWidth = (width - 10 * (numColumns + 1)) / numColumns;
        const thumbnailUrl = item.imageUrl;

        return (
            <TouchableOpacity onPress={() => handleItemPress(item)} style={[styles.itemContainer, { width: itemWidth }]}>
                {
                    thumbnailUrl ? (
                        <Image source={{ uri: thumbnailUrl }} style={styles.itemImage} />
                    ) : (
                        // 이미지가 없을 때 보여줄 플레이스홀더 (아이콘 등 추가 가능)
                        <View style={[styles.itemImage, styles.imagePlaceholder]}>
                            <Text style={{ color: '#aaa', fontSize: 20 }}>GAME</Text>
                        </View>
                    )
                }
                <View style={styles.itemTextContainer}>
                    <Text style={styles.itemTitle} numberOfLines={2}>
                        {item.title}
                    </Text>
                    {/* 가격 대신 게임 설명 표시 */}
                    <Text style={styles.itemDesc} numberOfLines={1}>
                        {item.description}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

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
                key={numColumns}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    !isLoading ? (
                        <Text style={styles.emptyText}>등록된 게임이 없습니다.</Text>
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

// 스타일은 Store와 99% 동일 (itemPrice -> itemDesc 이름만 변경)
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 5,
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
        // 그림자 효과 살짝 추가 (Store에 없었다면 제거해도 됨)
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    itemImage: {
        width: '100%',
        aspectRatio: 1,
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
        fontSize: 16, // 제목 폰트 살짝 키움
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
        minHeight: 24,
    },
    itemDesc: { // 가격 스타일 대체
        fontSize: 14,
        color: '#666',
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

export default Games;
