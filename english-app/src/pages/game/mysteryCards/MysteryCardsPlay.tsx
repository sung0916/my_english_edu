import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "@/api";
import { CardOption } from "@/api/gameApi";
import GameHeader from "@/components/game/common/GameHeader";
import useBGM from "@/hooks/game/useBGM";
import { useGameTimer } from "@/hooks/game/useGameTimer";
import { useMysteryCardGame } from "@/hooks/game/useMysteryCardGame";
import { useGameStore } from "@/store/gameStore";

// 사운드 파일 import
import correctMp3 from '@/assets/audio/game/correct.mp3';
import wrongMp3 from '@/assets/audio/game/wrong.mp3';
import flipMp3 from '@/assets/audio/game/card_flip.mp3';

const AUDIO_URLS = {
    correct: correctMp3,
    wrong: wrongMp3,
    flip: flipMp3,
};

// --- 카드 컴포넌트 ---
interface GameCardProps {
    option: CardOption;
    onPress: () => void;
    disabled: boolean;
    isFlipped: boolean; // 외부에서 뒤집힘 상태 제어 (맞췄거나, 애니메이션 중이거나)
}

const GameCard = ({ option, onPress, disabled, isFlipped }: GameCardProps) => {
    // 이미지 URL 처리
    const safeImageUrl = option.imageUrl || "";
    const fullImageUrl = safeImageUrl.startsWith('http') 
        ? safeImageUrl 
        : `${API_BASE_URL}${safeImageUrl}`;

    return (
        <div 
            className={`relative w-full aspect-[3/4] cursor-pointer perspective-1000 ${disabled ? 'cursor-not-allowed' : ''}`}
            onClick={!disabled ? onPress : undefined}
        >
            <div 
                className={`w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
            >
                {/* 앞면 (텍스트) */}
                <div 
                    className="absolute w-full h-full bg-[#3B82F6] border-4 border-[#2563EB] rounded-xl flex items-center justify-center p-2 backface-hidden shadow-lg"
                >
                    <span className="text-white font-bold text-center text-sm md:text-lg break-words">
                        {option.word}
                    </span>
                </div>

                {/* 뒷면 (이미지) */}
                <div 
                    className="absolute w-full h-full bg-white border border-gray-200 rounded-xl overflow-hidden rotate-y-180 backface-hidden shadow-lg"
                >
                    <img 
                        src={fullImageUrl} 
                        alt="card" 
                        className="w-full h-full object-cover" 
                    />
                </div>
            </div>
        </div>
    );
};

// --- 메인 게임 페이지 ---
export default function MysteryCardsGamePage() {
    const { isPaused, isMuted } = useGameStore();
    const { playSfxWithDucking } = useBGM('mysterycard');
    
    // 로직 훅
    const {
        loading, currentQuestion, questionLength, currentIndex,
        score, lives, isProcessing, wrongCardId, limitSeconds,
        handleAnswer, handleTimeOver, resetWrongCard
    } = useMysteryCardGame();

    // 뒤집힘 상태 로컬 관리 (애니메이션 연동)
    const [flippedCardIds, setFlippedCardIds] = useState<number[]>([]);

    // 사운드 재생
    const playSound = (type: keyof typeof AUDIO_URLS) => {
        if (isMuted) return;
        const audio = new Audio(AUDIO_URLS[type]);
        
        if (type === 'flip') {
            audio.play().catch(() => {});
        } else {
            playSfxWithDucking(async () => {
                try { await audio.play(); } catch (e) {}
            }, type === 'correct' ? 1000 : 500);
        }
    };

    // 타이머
    const { timeLeft, resetTimer } = useGameTimer({
        initialTime: limitSeconds,
        shouldRun: !loading && !isProcessing && !isPaused,
        onTimeOver: () => {
            playSound('wrong');
            handleTimeOver();
        }
    });

    useEffect(() => {
        resetTimer();
        setFlippedCardIds([]); // 문제 바뀌면 카드 모두 덮기
    }, [currentIndex]);

    // 오답 시 카드 다시 뒤집기 (resetWrongCard와 연동)
    useEffect(() => {
        if (wrongCardId !== null) {
            // wrongCardId가 설정되면 해당 카드는 이미 뒤집혀 있음
            // 일정 시간 후 뒤집힌 상태 해제
            const timer = setTimeout(() => {
                setFlippedCardIds(prev => prev.filter(id => id !== wrongCardId));
                resetWrongCard();
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [wrongCardId]);

    const handleCardClick = (opt: CardOption) => {
        if (isPaused || isProcessing || flippedCardIds.includes(opt.wordId)) return;

        // 1. 뒤집기 애니메이션 시작 & 소리
        playSound('flip');
        setFlippedCardIds(prev => [...prev, opt.wordId]);

        // 2. 애니메이션 얼추 진행된 후 정답 체크 (0.4초 후)
        setTimeout(() => {
            const isCorrect = handleAnswer(opt); // 훅 내부 로직 호출
            if (isCorrect) {
                playSound('correct');
                // 정답이면 뒤집힌 상태 유지
            } else {
                playSound('wrong');
                // 오답이면 wrongCardId가 세팅되면서 useEffect에 의해 다시 덮힘
            }
        }, 400);
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#F3F4F6]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-[#F3F4F6] overflow-hidden relative">
            <GameHeader />

            <div className="flex-1 flex flex-col items-center bg-[#F0F9FF] overflow-y-auto pb-10">
                {/* 상단 정보바 */}
                <div className="w-full flex justify-between items-center px-5 py-3 bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
                    <div className="flex gap-1 text-2xl">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <span key={i}>{i < lives ? '❤️' : '💔'}</span>
                        ))}
                    </div>

                    <span className="text-xl font-bold text-[#2563EB]">{score} Pts</span>

                    <div className={`px-3 py-1 rounded-full ${timeLeft <= 3 ? 'bg-red-100 text-red-600' : 'bg-[#E0F2FE] text-[#0284C7]'}`}>
                        <span className="font-bold">⏱️ {timeLeft}s</span>
                    </div>
                </div>

                {/* 게임 컨텐츠 */}
                <div className="w-full max-w-4xl px-4 mt-6">
                    <div className="text-center mb-6">
                        <span className="text-sm text-gray-500 block mb-2">
                            Question {currentIndex + 1} / {questionLength}
                        </span>
                        
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-2">
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 break-keep">
                                {currentQuestion?.sentence}
                            </h2>
                            <p className="text-gray-400 text-sm">Find the matching card!</p>
                        </div>
                    </div>

                    {/* 카드 그리드 */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mx-auto max-w-3xl">
                        {currentQuestion?.options.map((opt) => (
                            <GameCard
                                key={`${currentIndex}-${opt.wordId}`}
                                option={opt}
                                disabled={isProcessing || isPaused}
                                isFlipped={flippedCardIds.includes(opt.wordId)}
                                onPress={() => handleCardClick(opt)}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* 일시정지 오버레이 */}
            {isPaused && (
                <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-50 backdrop-blur-sm">
                    <span className="text-4xl font-bold text-gray-600">PAUSED</span>
                </div>
            )}
        </div>
    );
}
