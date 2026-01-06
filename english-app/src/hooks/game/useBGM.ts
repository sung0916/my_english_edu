import { useGameStore } from "@/store/gameStore";
import { useEffect, useRef } from "react";

// Web에서는 require 대신 경로 문자열이나 import 사용 권장
// public 폴더에 오디오 파일이 있다고 가정, 또는 import 사용
import bgmCrossword from '@/assets/audio/game/bgm/crossWordPuzzleBgm.mp3';
import bgmFalling from '@/assets/audio/game/bgm/fallingWordsBgm.mp3';
import bgmMaze from '@/assets/audio/game/bgm/mazeAdventureBgm.mp3';
import bgmMystery from '@/assets/audio/game/bgm/mysteryCardsBgm.mp3';

const BGM_FILES = {
    crossword: bgmCrossword,
    fallingword: bgmFalling,
    mazeadventure: bgmMaze,
    mysterycard: bgmMystery,
};

type GameType = 'crossword' | 'fallingword' | 'mazeadventure' | 'mysterycard';

export default function useBGM(gameType: GameType) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const { isMuted } = useGameStore();
    const fadeIntervalRef = useRef<any>(null);

    // 1. BGM 초기화 및 재생
    useEffect(() => {
        const audio = new Audio(BGM_FILES[gameType]);
        audio.loop = true;
        audio.volume = isMuted ? 0 : 1.0;
        
        // 브라우저 정책상 사용자 상호작용 없이 자동 재생이 막힐 수 있음 (예외처리)
        audio.play().catch(e => console.log("Auto-play blocked:", e));
        
        audioRef.current = audio;

        return () => {
            audio.pause();
            audio.currentTime = 0;
            if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
        };
    }, [gameType]); // gameType 변경 시 재생성

    // 2. 음소거 감지
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : 1.0;
        }
    }, [isMuted]);

    // 3. Ducking 구현 (볼륨 줄였다 키우기)
    const playSfxWithDucking = async (sfxFunc: () => Promise<void>, duration: number = 1000) => {
        if (!audioRef.current || isMuted) {
            await sfxFunc();
            return;
        }

        // Fade Out
        fadeVolume(1.0, 0.2, 300);

        await sfxFunc();

        setTimeout(() => {
            // Fade In
            fadeVolume(0.2, 1.0, 500);
        }, duration);
    };

    const fadeVolume = (from: number, to: number, time: number) => {
        if (!audioRef.current) return;
        
        const steps = 20;
        const stepTime = time / steps;
        const diff = to - from;
        let currentStep = 0;

        if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

        fadeIntervalRef.current = setInterval(() => {
            currentStep++;
            const newVol = from + (diff * (currentStep / steps));
            
            if (audioRef.current) {
                audioRef.current.volume = Math.max(0, Math.min(1, newVol));
            }

            if (currentStep >= steps) {
                clearInterval(fadeIntervalRef.current);
            }
        }, stepTime);
    };

    return { playSfxWithDucking };
}
