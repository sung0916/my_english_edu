import { GameRecord, useGameStore } from "@/store/gameStore";
import { crossPlatformAlert, crossPlatformConfirm } from "@/utils/crossPlatformAlert";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import GameRecordsModal from "./GameRecords";

export default function GameHeader() {
    const router = useRouter();
    const { isMuted, toggleMute, resetGame } = useGameStore();
    const [modalVisible, setModalVisible] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // 더미 데이터
    const dummyRecords: GameRecord[] = [
        { gameName: 'Falling Words', highScore: 1200, updatedAt: '2025-12-01' },
    ];

    // 홈으로 가기
    // const handleBack = () => {
    //     crossPlatformAlert(
    //         '', 
    //         '홈으로 이동하시겠습니까?', 
    //         () => {
    //             resetGame();
                
    //             if (Platform.OS === 'web') {
    //                 router.replace(`/main/games/${gameId}`);
                
    //             } else {
    //                 router.back();
    //             }
    //         }
    //     )
    // };

    // 나가기
    const handleExit = () => {
        crossPlatformConfirm(
            '',
            '게임을 종료하고 나가시겠습니까?',
            () => {
                resetGame();

                if (Platform.OS === 'web') {
                    // [Web] 새 창(팝업)으로 열렸으므로 창 닫기
                    window.close();

                } else {
                    // [Mobile] 메인 화면으로 이동
                    router.replace('/main/games');
                }
            }
        );
    };

    // 전체화면
    const toggleFullscreen = () => {
        if (Platform.OS === 'web') {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
                setIsFullscreen(true);

            } else {
                // 모바일에서는 StatusBar 숨기기 기능으로 구현 예정
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        } else {
            crossPlatformAlert('info', '모바일 전체화면은 기기 설정에서 제어됩니다.');
        }
    };

    const handleRecord = () => {
        crossPlatformAlert("Recording", "음성 녹음 기능 준비 중");
    }

    return (
        <>
            <View style={styles.container}>
                {/* 뒤로가기 | 나가기 */}
                <TouchableOpacity onPress={handleExit} style={styles.iconButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>

                {/* 기능 버튼 그룹 */}
                <View style={styles.rightGroup}>
                    {/* 전체화면 */}
                    <TouchableOpacity onPress={toggleFullscreen} style={styles.iconButton}>
                        <Ionicons name={isFullscreen ? "contract" : "expand"} size={24} color="#333" />
                    </TouchableOpacity>

                    {/* 음소거 */}
                    <TouchableOpacity onPress={toggleMute} style={styles.iconButton}>
                        <Ionicons name={isMuted ? "volume-mute" : "volume-high"} size={24} color="#333" />
                    </TouchableOpacity>

                    {/* 녹음 */}
                    <TouchableOpacity onPress={handleRecord} style={styles.iconButton}>
                        <Ionicons name="mic" size={24} color="#E74C3C" />
                    </TouchableOpacity>

                    {/* 기록 보기 */}
                    <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.iconButton}>
                        <Ionicons name="list" size={24} color="#3498DB" />
                    </TouchableOpacity>

                    {/* 바로 나가기 */}
                    <TouchableOpacity onPress={handleExit} style={[styles.iconButton, styles.exitBtn]}>
                        <Ionicons name="close-circle" size={28} color="#C0392B" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* 기록 모달 연결 */}
            <GameRecordsModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                records={dummyRecords}
            />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 60,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        elevation: 2,
        zIndex: 10, // 게임 요소보다 위에 뜨도록
    },
    rightGroup: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        padding: 8,
        marginLeft: 8,
    },
    exitBtn: {
        marginLeft: 16,
    }
});
