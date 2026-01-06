import { useGameStore } from "@/store/gameStore";

// 오디오 파일 import
import correctMp3 from '@/assets/audio/game/correct.mp3';
import wrongMp3 from '@/assets/audio/game/wrong.mp3';

export const useGameSound = () => {
    const isMuted = useGameStore((state) => state.isMuted);

    const playSound = (src: string) => {
        if (isMuted) return;
        const audio = new Audio(src);
        audio.volume = 0.8; 
        audio.play().catch(() => {});
    };

    const playCorrect = () => playSound(correctMp3);
    const playWrong = () => playSound(wrongMp3);

    return { playCorrect, playWrong };
};
