import { GameRecordDto } from "@/api/gameApi";
import { IoClose } from "react-icons/io5";
import React from "react";

interface Props {
    visible: boolean;
    onClose: () => void;
    records: GameRecordDto[];
}

export default function GameRecordsModal({ visible, onClose, records }: Props) {
    if (!visible) return null; // 조건부 렌더링

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    const formatDisplayScore = (gameName: string, score: number) => {
        const name = (gameName || '').toLowerCase().replace(/\s/g, '');

        // Maze Adventure & Crossword Puzzle
        if (name.includes('maze') || name.includes('crossword')) {
            return `Level ${score} Clear${score >= 3 ? ' 🎉' : ''}`;
        }

        // Falling Words & Mystery Cards
        if (name.includes('falling') || name.includes('mystery')) {
            return `${score} pts${score === 100 ? ' 🎉' : ''}`;
        }

        return score.toString();
    };

    // 모달 배경 클릭 시 닫기
    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={handleOverlayClick}
        >
            <div className="bg-white w-full max-w-lg max-h-[80vh] rounded-2xl shadow-xl overflow-hidden flex flex-col animate-fadeIn">
                
                {/* 헤더 */}
                <div className="flex flex-row justify-between items-center p-5 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">🏆 Best Records 🏆</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition">
                        <IoClose size={28} color="#333" />
                    </button>
                </div>

                {/* 테이블 헤더 */}
                <div className="flex flex-row border-b-2 border-gray-100 px-5 py-2 bg-gray-50 text-sm text-gray-600 font-semibold">
                    <div className="flex-[2]">Game</div>
                    <div className="flex-1 text-center">Record</div>
                    <div className="flex-[1.5] text-right">Date</div>
                </div>

                {/* 리스트 (스크롤 영역) */}
                <div className="overflow-y-auto p-5">
                    {records.length === 0 ? (
                        <div className="flex items-center justify-center py-10 text-gray-500">
                            There is no data
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {records.map((item, index) => (
                                <div key={index} className="flex flex-row py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition">
                                    {/* 게임 이름 */}
                                    <div className="flex-[2] font-semibold text-gray-800 truncate pr-2">
                                        {item.gameName || `Game ${item.gameId}`}
                                    </div>

                                    {/* 점수 */}
                                    <div className="flex-1 text-center font-bold text-[#E67E22]">
                                        {formatDisplayScore(item.gameName || '', item.highScore)}
                                    </div>

                                    {/* 날짜 */}
                                    <div className="flex-[1.5] text-right text-sm text-gray-400">
                                        {formatDate(item.updatedAt)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
