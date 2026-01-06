import { CardOption, fetchGameContent, MysteryCardData, submitGameScore } from "@/api/gameApi";
import { useUserStore } from "@/store/userStore";
import { crossPlatformAlert } from "@/utils/crossPlatformAlert";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export const useMysteryCardGame = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // React Router DOM의 Query Param 훅 사용
    const [searchParams] = useSearchParams();
    const gameId = searchParams.get('gameId');
    const level = searchParams.get('level');

    const { user } = useUserStore();

    // 게임 데이터 상태
    const [questions, setQuestions] = useState<MysteryCardData[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [limitSeconds, setLimitSeconds] = useState(10);

    // 플레이 중 상태
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [wrongCardId, setWrongCardId] = useState<number | null>(null);

    // 게임 데이터 로드
    useEffect(() => {
        const loadData = async () => {
            if (!gameId || !level) return;

            try {
                const gId = Number(gameId);
                const lv = String(level);
                const response = await fetchGameContent<MysteryCardData>(gId, lv);

                if (response.items && response.items.length > 0) {
                    setQuestions(response.items);
                    setLimitSeconds(response.timeLimit || 20);
                
                } else {
                    crossPlatformAlert('', 'Game data not found');
                    navigate(-1);
                }
            } catch (error) {
                console.error(error);
                crossPlatformAlert('', 'Failed to load Game');
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [gameId, level, navigate]);

    // 다음 문제로 이동
    const nextQuestion = (finalScore?: number) => {
        const currentScore = finalScore !== undefined ? finalScore : score;

        setWrongCardId(null);  // 플립 상태 초기화

        if (currentIndex < questions.length - 1) {
            setCurrentIndex((prev) => prev + 1);
            setLives(3);  // 다음 문제 찬스 리셋

            // 딜레이 후 입력 잠금 해제
            setTimeout(() => {
                setIsProcessing(false);
            }, 500);

        } else {
            // 마지막 문제라면 게임 오버
            handleGameOver(currentScore);
        }
    };

    // 게임 오버 - 종료 처리
    const handleGameOver = async (finalScore: number) => {
        setIsProcessing(true);  // 입력 막기
        try {
            if (user && user.userId) {
                await submitGameScore(Number(gameId), user.userId, finalScore);
            }
            crossPlatformAlert('Game Over', `Final Score: ${finalScore}`);
            
            // Web 라우팅 처리
            const lobbyPath = location.pathname.replace('/play', '');
            navigate(lobbyPath, { replace: true });

        } catch (e) {
            console.error(e);
            navigate(-1);
        }
    };

    // 정답 체크 (View에서 호출)
    const handleAnswer = (option: CardOption): boolean => {
        if (isProcessing) return false;

        if (option.isAnswer) {  // 정답
            setIsProcessing(true);  // 전환 중 클릭 방지

            const newScore = score + 10;
            setScore(newScore);

            // 0.8초 뒤 다음 문제
            setTimeout(() => nextQuestion(newScore), 800);
            return true;

        } else {  // 오답
            const nextLives = lives - 1;
            setLives(nextLives);
            setWrongCardId(option.wordId);  // 뒤집기 애니메이션 트리거

            if (nextLives <= 0) {  // 생명 소진 시 점수 없이 다음 문제
                setIsProcessing(true);
                setTimeout(nextQuestion, 800);
            }

            return false;
        }
    };

    // 시간 초과 처리
    const handleTimeOver = () => {
        if (isProcessing) return;

        setIsProcessing(true);
        setTimeout(() => nextQuestion(score), 800);  // 시간 초과 시 다음 문제로
    }

    // 오답 카드 복구 완료 처리
    const resetWrongCard = () => {
        setWrongCardId(null);
    };

    return {
        // 상태 반환
        loading,
        currentQuestion: questions[currentIndex],
        questionLength: questions.length,
        currentIndex,
        score,
        lives,
        isProcessing,
        wrongCardId,
        limitSeconds,

        // 액션 반환
        handleAnswer,
        handleTimeOver,
        resetWrongCard,
    };
};
