// 게임 상태(점수, 일시정지, 음소거, 전체화면 등) 관리

import { create } from "zustand";

export interface GameRecord {  // 백엔드 DTO와 맞출 인터페이스
    gameName: string;
    highScore: number;
    updatedAt: string;
}

interface GameState {
    // 공통으로 사용할 상태
    score: number;
    level: string;
    isPlaying: boolean;
    isPaused: boolean;
    isMuted: boolean;

    // 액션
    setScore: (score: number) => void;
    addScore: (poins: number) => void;
    setLevel: (level: string) => void;
    setIsPlaying: (status: boolean) => void;
    setIsPaused: (status: boolean) => void;
    toggleMute: () => void;
    resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
    score: 0,
    level: "1",
    isPlaying: false,
    isPaused: false,
    isMuted: false,

    setScore: (score) => set({ score }),
    addScore: (points) => set((state) => ({ score: state.score + points })),
    setLevel: (level) => set({ level }),
    setIsPlaying: (status) => set({ isPlaying: status }),
    setIsPaused: (status) => set({ isPaused: status }),
    toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

    resetGame: () => set({
        score: 0,
        level: "1",
        isPlaying: false,
        isPaused: false
        // isMuted는 사용자 설정이므로 초기화하지 않음
    }),
}));
