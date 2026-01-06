import { useState, useRef } from "react";

export const useGameRecorder = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordUri, setRecordUri] = useState<string | null>(null); // 웹에서는 Blob URL 사용
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<BlobPart[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            
            chunksRef.current = []; // 초기화

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' }); // 웹 표준 포맷
                const audioUrl = URL.createObjectURL(blob);
                setRecordUri(audioUrl);
                
                // 확인용 재생
                const audio = new Audio(audioUrl);
                audio.play();
            };

            mediaRecorder.start();
            mediaRecorderRef.current = mediaRecorder;
            setIsRecording(true);
            console.log("Web Recording Started");

        } catch (err) {
            console.error("Microphone permission denied or not supported", err);
            alert("Microphone permission is required");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            // 스트림 트랙 종료 (마이크 끄기)
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            
            setIsRecording(false);
            console.log("Web Recording Stopped");
        }
    };

    return {
        isRecording,
        startRecording,
        stopRecording,
        recordUri
    };
};
