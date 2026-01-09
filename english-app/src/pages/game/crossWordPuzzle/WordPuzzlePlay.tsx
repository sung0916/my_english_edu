import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { CrosswordData, fetchGameContent, submitGameScore } from "@/api/gameApi";
import { useGameStore } from "@/store/gameStore";
import { useUserStore } from "@/store/userStore";
import { crossPlatformAlert } from "@/utils/crossPlatformAlert";
import useBGM from "@/hooks/game/useBGM";
import GameHeader from "@/components/game/common/GameHeader";
import { useGameSound } from "@/hooks/game/useGameSound"; // 새로 만든 훅 사용

const GAME_ID = 4;
const LEVEL_MAP: Record<string, string> = {
    '1': 'FIRST', '2': 'SECOND', '3': 'THIRD', '4': 'FOURTH', '5': 'FIFTH',
};

export default function CrosswordPuzzlePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const level = searchParams.get('level');
    
    const { user } = useUserStore();
    const { setIsPlaying, resetGame } = useGameStore();
    const { playSfxWithDucking } = useBGM('crossword'); // BGM
    const { playCorrect, playWrong } = useGameSound(); // 효과음 (playSfxWithDucking과 조합)

    // === State ===
    const [isLoading, setIsLoading] = useState(true);
    const [gameData, setGameData] = useState<CrosswordData | null>(null);
    const [foundWordIds, setFoundWordIds] = useState<number[]>([]);
    const [inputText, setInputText] = useState("");
    const [activeHint, setActiveHint] = useState<string>("Find the hidden words!");
    const [hintCount, setHintCount] = useState(10);
    const [hasTyped, setHasTyped] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);
    const gameLevelKey = LEVEL_MAP[level || '1'] || 'FIRST';

    useEffect(() => {
        resetGame();
        loadGameData();

        return () => {
            setIsPlaying(false);
        };
    }, []);

    // 효과음 재생 래퍼 (BGM 줄이기 적용)
    const playSoundEffect = (type: 'correct' | 'wrong') => {
        const soundFunc = async () => {
            if (type === 'correct') playCorrect();
            else playWrong();
        };
        playSfxWithDucking(soundFunc, 1000);
    };

    const loadGameData = async () => {
        try {
            setIsLoading(true);
            const response = await fetchGameContent<CrosswordData>(GAME_ID, gameLevelKey);
            if (response.items && response.items.length > 0) {
                setGameData(response.items[0]);
                setIsPlaying(true);
            }
        } catch (error) {
            crossPlatformAlert("Error", "Failed to load game data.");
            navigate(-1);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = () => {
        if (!inputText.trim()) return;
        setHasTyped(true);

        if (!gameData) return;
        const text = inputText.toUpperCase().trim();

        const isAlreadyFound = gameData.words.some(w =>
            w.word === text && foundWordIds.includes(w.wordId)
        );

        if (isAlreadyFound) {
            setInputText("");
            return;
        }

        const matchedWord = gameData.words.find(w => w.word === text);

        if (matchedWord) {
            // ✅ 정답
            playSoundEffect('correct');
            setFoundWordIds(prev => [...prev, matchedWord.wordId]);
            setInputText("");
            setActiveHint(`Found: ${matchedWord.word}`);

            if (foundWordIds.length + 1 === gameData.words.length) {
                handleGameClear();
            }
        } else {
            // ❌ 오답
            playSoundEffect('wrong');
            setInputText("");
        }
        
        // 입력 후 다시 포커스 유지
        inputRef.current?.focus();
    };

    const useHint = () => {
        if (!gameData || hintCount <= 0) return;
        const hiddenWords = gameData.words.filter(w => !foundWordIds.includes(w.wordId));
        if (hiddenWords.length > 0) {
            const randomWord = hiddenWords[Math.floor(Math.random() * hiddenWords.length)];
            setActiveHint(`HINT: ${randomWord.clue}`);
            setHintCount(prev => prev - 1);
        }
    };

    const handleGameClear = async () => {
        setIsPlaying(false);
        const levelScore = parseInt(level || "1");
        if (user?.userId) {
            await submitGameScore(GAME_ID, user.userId, levelScore);
        }
        
        if (window.confirm(`🎉 Cleared!\nAll words found!`)) {
            const lobbyPath = location.pathname.replace('/play', '');
            navigate(lobbyPath, { replace: true });
        } else {
            navigate(-1);
        }
    };

    const getCellStatus = (r: number, c: number) => {
        if (!gameData) return false;
        return gameData.words.some(w => {
            if (!foundWordIds.includes(w.wordId)) return false;
            const len = w.word.length;
            if (w.direction === 'ACROSS') {
                return r === w.startRow && c >= w.startCol && c < w.startCol + len;
            } else {
                return c === w.startCol && r >= w.startRow && r < w.startRow + len;
            }
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    if (isLoading || !gameData) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#F9EBEA]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E74C3C]"></div>
            </div>
        );
    }

    // 그리드 계산을 위한 스타일
    // CSS Grid를 사용하여 동적으로 처리
    const gridSize = gameData.gridSize;

    return (
        <div className="flex flex-col h-screen bg-[#F9EBEA] overflow-hidden">
            {/* 1. 헤더 */}
            <GameHeader />

            {/* 2. 게임 영역 (중앙 정렬) */}
            <div className="flex-1 flex flex-col items-center justify-between p-4 pb-8 w-full max-w-[600px] mx-auto min-w-[320px]">
                
                {/* 상단 정보 */}
                <div className="py-2">
                    <span className="text-lg font-bold text-[#34495E]">
                        Found: {foundWordIds.length} / {gameData.words.length}
                    </span>
                </div>

                {/* 그리드 보드 */}
                <div className="flex justify-center items-center my-4">
                    <div 
                        className="grid gap-[2px] bg-transparent p-2 rounded-lg shadow-lg border border-gray-200 bg-white"
                        style={{
                            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                            width: 'min(90vw, 500px)', // 반응형 너비
                            aspectRatio: '1/1'
                        }}
                    >
                        {gameData.grid.map((row, r) => (
                            row.map((char, c) => {
                                const isFound = getCellStatus(r, c);
                                return (
                                    <div
                                        key={`${r}-${c}`}
                                        className={`
                                            flex items-center justify-center rounded-md border text-sm md:text-base font-bold select-none transition-colors duration-300
                                            ${isFound 
                                                ? 'bg-[#F1C40F] border-[#F39C12] text-white scale-105 shadow-sm z-10' 
                                                : 'bg-white border-[#BDC3C7] text-[#7F8C8D]'
                                            }
                                        `}
                                    >
                                        {char}
                                    </div>
                                );
                            })
                        ))}
                    </div>
                </div>

                {/* 하단 컨트롤러 (모바일 키보드 회피 대신 상단 고정 혹은 하단 고정) */}
                <div className="w-full bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
                    {/* 힌트 표시 */}
                    <div className="bg-[#ECF0F1] rounded-lg p-3 mb-3 min-h-[44px] flex items-center justify-center">
                        <span className="text-[#2C3E50] font-semibold text-center text-sm md:text-base">
                            {activeHint}
                        </span>
                    </div>

                    {/* 입력 영역 */}
                    <div className="flex gap-2">
                        <button
                            onClick={useHint}
                            disabled={hintCount === 0}
                            className={`
                                px-3 py-2 rounded-lg text-xs font-bold text-white whitespace-nowrap transition-colors
                                ${hintCount > 0 ? 'bg-[#95A5A6] hover:bg-[#7F8C8D]' : 'bg-[#D7DBDD] cursor-not-allowed'}
                            `}
                        >
                            Hint ({hintCount})
                        </button>

                        <input
                            ref={inputRef}
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={hasTyped ? "" : "Type Word..."}
                            className="flex-1 h-12 border-2 border-[#3498DB] rounded-lg px-3 text-center text-lg font-bold outline-none focus:ring-2 focus:ring-[#3498DB]/50"
                            autoComplete="off"
                        />

                        <button 
                            onClick={handleSubmit}
                            className="w-12 h-12 bg-[#3498DB] rounded-lg flex items-center justify-center text-white text-xl font-bold hover:bg-[#2980B9] transition-colors active:scale-95"
                        >
                            ⏎
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
