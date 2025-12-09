import { useGameStore } from "@/store/gameStore";
import { Audio } from "expo-av";
import { useEffect, useRef } from "react";

export const useGameSound = () => {
    const correctSound = useRef<Audio.Sound | null>(null);
    const wrongSound = useRef<Audio.Sound | null>(null);

    // gameStore.ts에서 음소거 상태 가져옴
    const isMuted = useGameStore((state) => state.isMuted);

    useEffect(() => {
        const loadSounds = async () => {
            try {
                // 소리 모드 설정 (IOS 무음 모드에서도 소리 나게 하려면 필수)
                await Audio.setAudioModeAsync({
                    playsInSilentModeIOS: true,
                    staysActiveInBackground: false,
                    shouldDuckAndroid: true,
                    playThroughEarpieceAndroid: false,
                })
                
                // 정답 소리 로드
                const { sound: s1 } = await Audio.Sound.createAsync(
                    require('@/assets/audio/game/correct.mp3')
                );
                correctSound.current = s1;

                // 오답 소리 로드
                const { sound: s2 } = await Audio.Sound.createAsync(
                    require('@/assets/audio/game/wrong.mp3')
                );
                wrongSound.current = s2;

            } catch (error) {
                console.log("사운드 에러: ", error);
            }
        };

        loadSounds();

        return () => {
            // 인마운트 시 메모리 해제
            correctSound.current?.unloadAsync();
            wrongSound.current?.unloadAsync();
        };
    }, []);

    const playCorrect = async () => {
        if (isMuted) return;  // 음소거면 재생 안함
        try { await correctSound.current?.replayAsync(); } catch {}
    };

    const playWrong = async () => {
        if (isMuted) return;  // 음소거면 재생 안함
        try { await wrongSound.current?.replayAsync(); } catch {}
    };

    return { playCorrect, playWrong };
};
