import { useGameStore } from "@/store/gameStore";
import { Audio } from "expo-av";
import { useEffect, useRef } from "react";

// BGM 파일 맵핑
const BGM_FILES = {
    crossword: require('@/assets/audio/game/bgm/crossWordPuzzleBgm.mp3'),
    fallingword: require('@/assets/audio/game/bgm/fallingWordsBgm.mp3'),
    mazeadventure: require('@/assets/audio/game/bgm/mazeAdventureBgm.mp3'),
    mysterycard: require('@/assets/audio/game/bgm/mysteryCardsBgm.mp3'),
};

type GameType = 'crossword' | 'fallingword' | 'mazeadventure' | 'mysterycard';

export default function useBGM(gameType: GameType) {
    const soundRef = useRef<Audio.Sound | null>(null);
    const { isMuted } = useGameStore();

    // 페이드 효과를 위한 Interval 관리
    const fadeIntervalRef = useRef<any>(null);

    // 1. BGM 초기화 및 재생
    useEffect(() => {
        loadBGM();

        return () => {
            unloadBGM();
        };
    }, []);

    // 2. 음소거 상태 감지
    useEffect(() => {
        if (soundRef.current) {
            if (isMuted) {
                soundRef.current.setVolumeAsync(0);
            } else {
                soundRef.current.setVolumeAsync(1.0);  // 기본 볼륨 복구
            }
        }
    }, [isMuted]);

    const loadBGM = async () => {
        try {
            const { sound } = await Audio.Sound.createAsync(
                BGM_FILES[gameType],
                {
                    isLooping: true,  // 무한루프
                    volume: isMuted ? 0 : 1.0,
                }
            );

            soundRef.current = sound;
            await sound.playAsync();

        } catch (err) {
            console.log('BGM load error : ', err);
        }
    };

    const unloadBGM = async () => {
        if (soundRef.current) {
            await soundRef.current.stopAsync();
            await soundRef.current.unloadAsync();
            soundRef.current = null;
        }

        if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    };

    // 3. Ducking (효과음 재생 시 BGM줄이기) / sfxPromise: 효과음 재생 함수 (Promise)
    const playSfxWithDucking = async (sfxFunc: () => Promise<void>, duration: number = 1000) => {

        if (!soundRef.current || isMuted) {
            await sfxFunc();  // BGM 없으면 효과음만 재생
            return;
        }

        // A. Fade Out
        await fadeVolume(1.0, 0.2, 300);  // 0.3초 동안 0.2로 줄임

        // B. 효과음 재생
        await sfxFunc();

        // C. 효과음이 끝날 때까지 대기(효과음 파일 길이 별로)
        setTimeout(async () => {

            // D. Fade in
            await fadeVolume(0.2, 1.0, 500);  // 0.5초 동안 복구
        }, duration);
    };

    // 볼륨 조절 애니메이션 함수
    const fadeVolume = (from: number, to: number, time: number) => {
        return new Promise<void>((resolve) => {
            if (!soundRef.current) return resolve();

            const steps = 10;
            const stepTime = time / steps;
            const stepValue = (to - from) / steps;
            let currentStep = 0;

            if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

            fadeIntervalRef.current = setInterval(async () => {
                currentStep++;
                const newVol = from + (stepValue * currentStep);

                try {
                    // 안전장치: 언마운트 되었으면 중단
                    if (soundRef.current) {
                        await soundRef.current.setVolumeAsync(Math.max(0, Math.min(1, newVol)));
                    }
                } catch (e) { }

                if (currentStep >= steps) {
                    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
                    resolve();
                }
            }, stepTime);
        });
    };

    return { playSfxWithDucking };
}
