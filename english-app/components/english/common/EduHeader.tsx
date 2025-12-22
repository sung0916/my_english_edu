import { crossPlatformAlert, crossPlatformConfirm } from "@/utils/crossPlatformAlert";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface EduHeaderProps {
    title: string; // 장소 이름 (예: Kitchen)
}

export default function EduHeader({ title }: EduHeaderProps) {
    const router = useRouter();

    // 상태 관리
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isRecording, setIsRecording] = useState(false); // 훅이 없다면 임시 state

    // 1. 홈으로 가기 (사실상 나가기)
    const handleExit = () => {
        crossPlatformConfirm(
            '',
            'Are you sure you want to leave?',
            () => {
                if (Platform.OS === 'web') {
                    window.close();
                } else {
                    router.back();
                }
            }
        );
    };

    // 2. 전체화면 토글
    const toggleFullscreen = () => {
        if (Platform.OS === 'web') {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch((err) => {
                    console.error(`Error attempting to enable fullscreen: ${err.message}`);
                });
                setIsFullscreen(true);
            } else {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        } else {
            crossPlatformAlert('Info', "Mobile fullscreen is handled automatically.");
        }
    };

    // 3. 음소거 토글
    const toggleMute = () => {
        setIsMuted(!isMuted);
        // 여기에 실제 오디오 음소거 로직 추가 (Context나 Store 연동)
        console.log("Mute toggled:", !isMuted); 
    };

    // 4. 녹음 토글 (UI만 구현)
    const handleRecordPress = () => {
        if (isRecording) {
            // stopRecording();
            setIsRecording(false);
            // crossPlatformAlert("", "Recording Stopped");
        } else {
            // startRecording();
            setIsRecording(true);
            // crossPlatformAlert("", "Recording Started");
        }
    };

    return (
        <View style={styles.container}>
            {/* 왼쪽: 타이틀 & 홈 버튼 */}
            <View style={styles.leftGroup}>
                <TouchableOpacity onPress={handleExit} style={styles.iconButton}>
                    <Ionicons name="home" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.titleText}>{title}</Text>
            </View>

            {/* 오른쪽: 기능 버튼들 */}
            <View style={styles.rightGroup}>
                
                {/* 녹음 버튼 */}
                <TouchableOpacity onPress={handleRecordPress} style={styles.iconButton}>
                    {isRecording ? (
                        <View style={styles.recordingIndicator}>
                            <Ionicons name="stop-circle" size={24} color="#E74C3C" />
                            <Text style={styles.recordingText}>REC</Text>
                        </View>
                    ) : (
                        <Ionicons name="mic" size={24} color="#333" />
                    )}
                </TouchableOpacity>

                {/* 음소거 버튼 */}
                <TouchableOpacity onPress={toggleMute} style={styles.iconButton}>
                    <Ionicons 
                        name={isMuted ? "volume-mute" : "volume-high"} 
                        size={24} 
                        color={isMuted ? "#95A5A6" : "#333"} 
                    />
                </TouchableOpacity>

                {/* 전체화면 버튼 */}
                <TouchableOpacity onPress={toggleFullscreen} style={styles.iconButton}>
                    <Ionicons name={isFullscreen ? "contract" : "expand"} size={24} color="#333" />
                </TouchableOpacity>

                {/* 나가기 버튼 (빨간색) */}
                <TouchableOpacity onPress={handleExit} style={[styles.iconButton, styles.exitBtn]}>
                    <Ionicons name="close" size={22} color="#C0392B" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 60,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        backgroundColor: '#fff', // 배경색
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        // 그림자
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
        zIndex: 100, // 맨 위에 표시
    },
    leftGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    titleText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2C3E50',
    },
    rightGroup: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        padding: 8,
        marginLeft: 4,
        justifyContent: 'center',
        alignItems: 'center'
    },
    exitBtn: {
        marginLeft: 12,
        backgroundColor: '#FDEDEC', // 연한 빨강 배경
        borderRadius: 20,
        padding: 6,
    },
    recordingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FDEDEC',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    recordingText: {
        color: '#E74C3C',
        fontSize: 10,
        fontWeight: 'bold',
        marginLeft: 4
    },
});
