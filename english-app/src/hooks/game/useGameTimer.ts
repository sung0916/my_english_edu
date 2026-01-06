import { useEffect, useRef, useState } from "react";

interface TimerProps {
    initialTime: number;
    onTimeOver: () => void;
    shouldRun: boolean;  // 게임 로딩 중 또는 정답 처리 중일때
}

export const useGameTimer = ({ initialTime, onTimeOver, shouldRun }: TimerProps) => {
    const [timeLeft, setTimeLeft] = useState(initialTime);
    
    // 브라우저 환경이므로 타이머 ID는 number입니다.
    const timerRef = useRef<number | null>(null);

    // 초기 시간 변경 감지 (레벨 변경 등)
    useEffect(() => {
        setTimeLeft(initialTime);
    }, [initialTime]);

    useEffect(() => {
        if (!shouldRun || timeLeft <= 0) {
            // window.clearInterval 사용 명시
            if (timerRef.current) window.clearInterval(timerRef.current);
            return;
        }

        // window.setInterval 사용 명시 (에러 해결 핵심)
        timerRef.current = window.setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    // 여기도 window.clearInterval
                    window.clearInterval(timerRef.current!);
                    onTimeOver();  // 시간 초과 콜백
                    return 0;
                }
                return prev - 1;
            });
        }, 2000); // 2초마다 감소 (기존 로직 유지)

        return () => {
            // 언마운트 시 클리어
            if (timerRef.current) window.clearInterval(timerRef.current);
        };
    }, [shouldRun, timeLeft, onTimeOver]);

    const resetTimer = () => setTimeLeft(initialTime);
    return { timeLeft, resetTimer };
};
