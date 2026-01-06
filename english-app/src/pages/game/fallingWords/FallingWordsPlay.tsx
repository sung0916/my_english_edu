import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { fetchGameContent, submitGameScore, WordDto } from "@/api/gameApi";
import GameHeader from "@/components/game/common/GameHeader";
import WordBubble from "@/components/game/fallingWords/WordBubble"; // 웹용으로 수정된 컴포넌트
import useBGM from "@/hooks/game/useBGM";
import { useGameStore } from "@/store/gameStore";
import { useUserStore } from "@/store/userStore";
import { crossPlatformAlert } from "@/utils/crossPlatformAlert";

// 사운드 파일 import
import waterdropMp3 from '@/assets/audio/game/waterdrop.mp3';

const GAME_ID = 1;

const LEVEL_CONFIG: Record<string, { dropSpeed: number; spawnInterval: number }> = {
    'FIRST': { dropSpeed: 18000, spawnInterval: 2500 },
    'SECOND': { dropSpeed: 15000, spawnInterval: 2000 },
    'THIRD': { dropSpeed: 12000, spawnInterval: 1800 },
    'FOURTH': { dropSpeed: 10000, spawnInterval: 1500 },
    'FIFTH': { dropSpeed: 8000, spawnInterval: 1000 },
};

const LEVEL_MAP: Record<string, string> = {
    '1': 'FIRST', '2': 'SECOND', '3': 'THIRD', '4': 'FOURTH', '5': 'FIFTH',
};

interface FallingWord extends WordDto {
    uid: number;
    x: number;
    y: number;
    speed: number;
    isMatched: boolean;
}

export default function FallingWordsGamePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const level = searchParams.get('level');
    const { playSfxWithDucking } = useBGM('fallingword');

    // Stores
    const { setScore, resetGame, isPaused, isPlaying, setIsPlaying } = useGameStore();
    const { user } = useUserStore();

    // Local States
    const [activeWords, setActiveWords] = useState<FallingWord[]>([]);
    const [inputText, setInputText] = useState('');
    const [lives, setLives] = useState(5);
    const [currentScore, setCurrentScore] = useState(0.0);
    const [isLoading, setIsLoading] = useState(true);

    // Refs
    const gameLevelKey = LEVEL_MAP[level || '1'] || 'FIRST';
    const config = LEVEL_CONFIG[gameLevelKey];

    const wordsQueue = useRef<WordDto[]>([]);
    const activeWordsRef = useRef<FallingWord[]>([]);
    const frameRef = useRef<number>(0);
    const lastSpawnTime = useRef<number>(0);
    const matchedCountRef = useRef(0);
    const totalWordsCount = useRef<number>(1);
    const scoreRef = useRef(0.0);
    
    // 화면 크기 (동적 계산)
    const gameAreaRef = useRef<HTMLDivElement>(null);

    // Audio 객체 (Web Audio API)
    const wrongSoundRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        resetGame();
        setLives(5);
        setCurrentScore(0.0);
        scoreRef.current = 0.0;
        setScore(0);
        matchedCountRef.current = 0;

        // 사운드 로드
        wrongSoundRef.current = new Audio(waterdropMp3);

        loadGameData();

        return () => {
            setIsPlaying(false);
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, []);

    const loadGameData = async () => {
        try {
            setIsLoading(true);
            const data = await fetchGameContent<WordDto>(1, gameLevelKey);

            if (data.items && data.items.length > 0) {
                wordsQueue.current = [...data.items];
                totalWordsCount.current = data.items.length;
                setIsPlaying(true);
            } else {
                crossPlatformAlert('', '게임 데이터 로딩 실패');
                navigate(-1);
            }
        } catch (error) {
            console.error(error);
            crossPlatformAlert('', '서버 연결 실패');
            navigate(-1);
        } finally {
            setIsLoading(false);
        }
    };

    // 게임 루프
    useEffect(() => {
        if (!isPlaying || isPaused || isLoading) {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
            return;
        }

        const gameLoop = (timestamp: number) => {
            if (timestamp - lastSpawnTime.current > config.spawnInterval) {
                if (wordsQueue.current.length > 0) {
                    spawnNewWord();
                    lastSpawnTime.current = timestamp;
                } else if (activeWordsRef.current.length === 0) {
                    gameOver(true);
                    return;
                }
            }
            updateWords();
            frameRef.current = requestAnimationFrame(gameLoop);
        };

        frameRef.current = requestAnimationFrame(gameLoop);
        return () => {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, [isPlaying, isPaused, isLoading]);

    const spawnNewWord = () => {
        const wordData = wordsQueue.current.pop();
        if (!wordData) return;

        const containerWidth = gameAreaRef.current?.clientWidth || window.innerWidth;
        const containerHeight = gameAreaRef.current?.clientHeight || window.innerHeight;

        // 랜덤 X 좌표 (좌우 여백 100px 정도 둠)
        const randomX = Math.random() * (containerWidth - 200) + 50;
        // 속도 계산 (높이를 dropSpeed ms 동안 통과)
        const pxPerFrame = containerHeight / (config.dropSpeed / 16.6);

        const newWord: FallingWord = {
            ...wordData,
            uid: Date.now() + Math.random(),
            x: randomX,
            y: -60,
            speed: pxPerFrame,
            isMatched: false,
        };

        activeWordsRef.current.push(newWord);
    };

    const updateWords = () => {
        const nextWords: FallingWord[] = [];
        let missed = false;
        const containerHeight = gameAreaRef.current?.clientHeight || window.innerHeight;

        activeWordsRef.current.forEach(word => {
            if (!word.isMatched) {
                word.y += word.speed;
            }

            if (word.y > containerHeight + 50) {
                if (!word.isMatched) missed = true;
            } else {
                nextWords.push(word);
            }
        });

        if (missed) {
            setLives(prev => {
                const newLives = prev - 1;
                if (newLives <= 0) gameOver(false);
                return newLives;
            });
        }

        activeWordsRef.current = nextWords;
        setActiveWords([...activeWordsRef.current]);
    };

    // 정답 체크
    const checkInput = () => {
        const text = inputText.trim();
        if (!text) return;

        const matchIndex = activeWordsRef.current.findIndex(
            w => !w.isMatched && w.content.toLowerCase() === text.toLowerCase()
        );

        if (matchIndex !== -1) {
            // 정답
            const matchedWord = activeWordsRef.current[matchIndex];
            matchedWord.isMatched = true;

            matchedCountRef.current += 1;
            const rawScore = (matchedCountRef.current / totalWordsCount.current) * 100;
            const displayScore = Math.min(100, parseFloat(rawScore.toFixed(1)));

            setCurrentScore(displayScore);
            scoreRef.current = displayScore;
            setScore(displayScore);

            playSfxWithDucking(async () => {
                // Web Speech API 사용
                const utterance = new SpeechSynthesisUtterance(matchedWord.content);
                utterance.lang = 'en-US';
                window.speechSynthesis.speak(utterance);
            });

            setInputText('');

            setTimeout(() => {
                activeWordsRef.current = activeWordsRef.current.filter(w => w.uid !== matchedWord.uid);
                setActiveWords([...activeWordsRef.current]);
            }, 500);

        } else {
            // 오답
            setInputText('');
            playSfxWithDucking(async () => {
                if (wrongSoundRef.current) {
                    wrongSoundRef.current.currentTime = 0;
                    wrongSoundRef.current.play().catch(() => {});
                }
            }, 500);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            checkInput();
        }
    };

    const gameOver = async (isClear: boolean) => {
        setIsPlaying(false);
        const finalIntScore = Math.round(scoreRef.current);
        const displayScore = finalIntScore >= 100 ? 100 : scoreRef.current;

        if (user && user.userId) {
            try {
                await submitGameScore(1, user.userId, finalIntScore);
            } catch (error) {
                console.error(error);
            }
        }

        crossPlatformAlert('', `최종 점수 : ${displayScore}`);
        
        const lobbyPath = location.pathname.replace('/play', '');
        navigate(lobbyPath, { replace: true });
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-[#E8F6F3]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3498DB]"></div>
                <span className="mt-4 text-gray-600">Loading words...</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-[#E8F6F3] overflow-hidden">
            <GameHeader />

            {/* 게임 영역 */}
            <div ref={gameAreaRef} className="flex-1 relative overflow-hidden w-full">
                {activeWords.map(word => (
                    <WordBubble
                        key={word.uid}
                        text={word.content}
                        meaning={word.meaning}
                        x={word.x}
                        y={word.y}
                        isMatched={word.isMatched}
                    />
                ))}

                {isPaused && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-20 backdrop-blur-sm">
                        <span className="text-4xl font-bold text-gray-600">PAUSED</span>
                    </div>
                )}
            </div>

            {/* HUD (정보 표시) - 우상단 고정 */}
            <div className="absolute top-[70px] right-5 bg-white/90 p-4 rounded-xl border border-gray-200 shadow-md flex flex-col items-end z-10 backdrop-blur-sm">
                <span className="text-xs text-gray-500 font-bold mb-1">{gameLevelKey}</span>
                <span className="text-3xl font-bold text-[#2C3E50]">
                    {Number.isInteger(currentScore) ? currentScore : currentScore.toFixed(1)}
                </span>
                <div className="flex mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className="text-sm mx-0.5">{i < lives ? '❤️' : '💔'}</span>
                    ))}
                </div>
            </div>

            {/* 입력창 */}
            <div className="bg-white p-4 border-t border-gray-200 w-full z-30">
                <div className="max-w-2xl mx-auto">
                    <input
                        type="text"
                        className="w-full h-14 border-2 border-[#3498DB] rounded-xl px-5 text-xl outline-none focus:ring-4 focus:ring-[#3498DB]/20 transition-all bg-white"
                        placeholder="Type here..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isPaused}
                        autoFocus
                        autoComplete="off"
                    />
                </div>
            </div>
        </div>
    );
}
