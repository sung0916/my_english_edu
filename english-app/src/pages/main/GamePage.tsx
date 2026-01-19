import React, { useCallback, useEffect, useState } from "react";
import { Pagination } from "@/components/common/Pagination";
import { crossPlatformAlert } from "@/utils/crossPlatformAlert";

const ITEMS_PER_PAGE = 4;

interface GameItem {
    id: number;
    title: string;
    description: string;
    imageUrl: string | null;
    route: string;
    isReady: boolean;
}

const EDU_GAMES: GameItem[] = [
    { id: 1, title: "Mystery Word Cards", description: "Select a word by reading sentence", imageUrl: null, route: "/game/mysteryCards", isReady: true },
    { id: 2, title: "Falling Words", description: "Type the falling words", imageUrl: null, route: "/game/fallingWords", isReady: true },
    { id: 3, title: "Maze Adventure", description: "Escape a maze", imageUrl: null, route: "/game/mazeAdventure", isReady: true },
    { id: 4, title: "Cross Word Puzzle", description: "Find words and type", imageUrl: null, route: "/game/crossWordPuzzle", isReady: true },
];

const GamePage = () => {
    // navigate 훅은 더 이상 필요 없으므로 제거해도 됩니다.
    const [isLoading, setIsLoading] = useState(true);
    const [items, setItems] = useState<GameItem[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const fetchItems = useCallback(async (page: number) => {
        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 300));
            const start = (page - 1) * ITEMS_PER_PAGE;
            const end = start + ITEMS_PER_PAGE;
            setItems(EDU_GAMES.slice(start, end));
            setTotalItems(EDU_GAMES.length);
        } catch (error) {
            crossPlatformAlert('오류', '목록 로드 실패');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchItems(currentPage); }, [currentPage, fetchItems]);

    // [수정됨] 새 창으로 게임 열기
    const handleItemClick = (game: GameItem) => {
        if (!game.isReady) return crossPlatformAlert("알림", "준비 중입니다.");

        // 창 크기 설정
        const width = 1200;
        const height = 900;
        
        // 화면 중앙 좌표 계산
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;

        // 전체 URL 생성 (현재 도메인 + 게임 라우트)
        const url = `${window.location.origin}${game.route}`;
        
        // 새 창 열기
        // 두 번째 인자(name)를 게임 ID별로 다르게 주어, 여러 게임을 동시에 켤 수 있게 함
        window.open(
            url, 
            `game_popup_${game.id}`, 
            `width=${width}, height=${height}, top=${top}, left=${left}, resizable=yes, scrollbars=no`
        );
    };

    return (
        <div className="p-5 min-h-screen bg-white">
            {isLoading ? (
                <div className="text-center mt-20">Loading...</div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                    {items.map((item) => (
                        <div 
                            key={item.id}
                            onClick={() => handleItemClick(item)}
                            className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md cursor-pointer transition-shadow"
                        >
                            <div className="aspect-square bg-gray-100 flex items-center justify-center text-gray-400 text-xl font-bold">
                                {item.imageUrl ? <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" /> : "GAME"}
                            </div>
                            <div className="p-3">
                                <h3 className="font-bold text-gray-800 text-lg mb-1 truncate">{item.title}</h3>
                                <p className="text-sm text-gray-500 truncate">{item.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {totalItems > 0 && (
                <div className="flex justify-center border-t border-gray-100 pt-4">
                    <Pagination
                        currentPage={currentPage}
                        totalItems={totalItems}
                        itemsPerPage={ITEMS_PER_PAGE}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )}
        </div>
    );
};

export default GamePage;