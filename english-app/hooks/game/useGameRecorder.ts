import { crossPlatformAlert } from "@/utils/crossPlatformAlert";
import { Audio } from "expo-av";
import { useState } from "react";

export const useGameRecorder = () => {
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordUri, setRecordUri] = useState<string | null>(null);

    // 녹음 시작
    const startRecording = async () => {
        try {
            // 권한 요청
            const perm = await Audio.requestPermissionsAsync();
            if (perm.status !== 'granted') {
                crossPlatformAlert('', 'Microphone permission is required');
                return;
            }

            // 오디오 모드 설정
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            // 녹음 시작
            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );

            setRecording(recording);
            setIsRecording(true);
            console.log('녹음 시작!!');

        } catch (err) {
            console.error('녹음 실패 : ', err);
            crossPlatformAlert('', "Recording doesn't work");
        }
    };

    // 녹음 종료
    const stopRecording = async () => {
        if (!recording) return;

        setRecording(null);
        setIsRecording(false);

        try {
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();
            setRecordUri(uri);
            console.log('녹음 중지, 저장 됨 : ', uri);

            // 바로 재생해서 확인
            const { sound } = await recording.createNewLoadedSoundAsync();
            await sound.playAsync();

            // crossPlatformAlert('', '녹음 완료');

        } catch (error) {
            console.error('녹음 중지 실패', error);
        }
    };

    return {
        isRecording,
        startRecording,
        stopRecording,
        recordUri
    };
};
