import { useEffect, useRef, useState } from "react";

interface TimerProps {
    initialTime: number;
    onTimeOver: () => void;
    shouldRun: boolean;  // 게임 로딩 중 또는 정답 처리 중일때
}

export const useGameTimer = ({ initialTime, onTimeOver, shouldRun }: TimerProps) => {
    const [timeLeft, setTimeLeft] = useState(initialTime);
    const timerRef = useRef<number | null>(null);

    // 초기 시간 변경 감지 (레벨 변경 등)
    useEffect(() => {
        setTimeLeft(initialTime);
    }, [initialTime]);

    useEffect(() => {
        if (!shouldRun || timeLeft <= 0) {
            if (timerRef.current) clearInterval(timerRef.current);
            return;
        }

        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);
                    onTimeOver();  // 시간 초과 콜백
                    return 0;
                }
                return prev - 1;
            });
        }, 2000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [shouldRun, timeLeft, onTimeOver]);

    const resetTimer = () => setTimeLeft(initialTime);
    return { timeLeft, resetTimer };
};
