import { fetchUserRecords, GameRecordDto } from "@/api/gameApi";
import { useGameRecorder } from "@/hooks/game/useGameRecorder";
import { useGameStore } from "@/store/gameStore";
import { useUserStore } from "@/store/userStore";
import { crossPlatformAlert, crossPlatformConfirm } from "@/utils/crossPlatformAlert";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, usePathname, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import GameRecordsModal from "./GameRecords";
    
export default function GameHeader() {
    const router = useRouter();
    const pathname = usePathname();  // 현재 경로 파악용
    const isAtLobby = !pathname.includes('/play');
    const navigation = useNavigation();

    // gameStore 상태 및 액션
    const { isMuted, toggleMute, isPaused, setIsPaused, resetGame } = useGameStore();
    const { user } = useUserStore();
    const [records, setRecords] = useState<GameRecordDto[]>([]);

    // 로컬 상태
    const [modalVisible, setModalVisible] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // 녹음 훅
    const { isRecording, startRecording, stopRecording } = useGameRecorder();

    useEffect(() => {
        if (modalVisible && user?.userId) {
            loadRecords();
        }
    }, [modalVisible]);

    const loadRecords = async () => {
        if (!user?.userId) return;
        try {
            const data = await fetchUserRecords(user.userId);
            const mappedData = data.map(r => ({
                ...r,
                gameName: getGameNameById(r.gameId)
            }));

            setRecords(mappedData);

        } catch (e) {
            console.error(e);
        }
    };

    const getGameNameById = (id: number) => {
        switch (id) {
            case 1: return 'Falling Words';
            case 2: return 'Mystery Cards';
            case 3: return 'Maze Adventure';
            case 4: return 'Crossword Puzzle';
            default: return `Game ${id}`;
        }
    };

    // 홈으로 가기
    const handleGoLobby = () => {
        // 일시정지 상태로 변경 (게임 멈춤)
        setIsPaused(true);

        crossPlatformConfirm(
            'Move to lobby',
            'Your game will not be saved',
            () => {
                resetGame();

                // 정규식으로 마지막 세그먼트(/play 등) 제거
                const lobbyPath = pathname.replace(/\/[^/]+$/, '');

                // 만약 경로 파싱이 꼬이면 기본 게임 목록으로 이동
                if (lobbyPath && lobbyPath !== '/game') {
                    router.replace(lobbyPath as any);

                } else {
                    router.replace('/main/games');
                }
            },
            () => {
                // 취소 시 일시정지 해제
                setIsPaused(false);
            }
        )
    };

    // 일시정지
    const togglePause = () => {
        setIsPaused(!isPaused);
    };

    // 나가기
    const handleExit = () => {
        crossPlatformConfirm(
            '',
            'Do you want to quit this game?',
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
            crossPlatformAlert('info', "Doesn't work in mobile");
        }
    };

    const handleRecordPress = () => {
        if (isRecording) {
            stopRecording();

        } else {
            startRecording();
        }
    }

    return (
        <>
            <View style={styles.container}>
                {/* 뒤로가기 | 나가기 */}
                <TouchableOpacity
                    onPress={handleGoLobby}
                    style={[styles.iconButton, { opacity: isAtLobby ? 0.3 : 1 }]}
                    disabled={isAtLobby}
                >
                    <Ionicons name="home" size={24} color="#333" />
                </TouchableOpacity>

                {/* 기능 버튼 그룹 */}
                <View style={styles.rightGroup}>
                    {/* 일시정지 */}
                    <TouchableOpacity onPress={togglePause} style={styles.iconButton}>
                        <Ionicons
                            name={isPaused ? 'play-circle' : 'pause-circle'}
                            size={26}
                            color={isPaused ? '#2ECC71' : '#f39C12'}
                        />
                    </TouchableOpacity>

                    {/* 전체화면 */}
                    <TouchableOpacity onPress={toggleFullscreen} style={styles.iconButton}>
                        <Ionicons name={isFullscreen ? "contract" : "expand"} size={24} color="#333" />
                    </TouchableOpacity>

                    {/* 음소거 */}
                    <TouchableOpacity onPress={toggleMute} style={styles.iconButton}>
                        <Ionicons name={isMuted ? "volume-mute" : "volume-high"} size={24} color="#333" />
                    </TouchableOpacity>

                    {/* 녹음 */}
                    <TouchableOpacity onPress={handleRecordPress} style={styles.iconButton}>
                        {isRecording ? (
                            <View style={styles.recordingIndicator}>
                                <Ionicons name="stop-circle" size={24} color="E74C3C" />
                                <Text style={styles.recordingText}>Rec</Text>
                            </View>
                        ) : (
                            <Ionicons name="mic" size={24} color="#333" />
                        )}
                    </TouchableOpacity>

                    {/* 기록 보기 */}
                    <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.iconButton}>
                        <Ionicons name="list" size={24} color="#3498DB" />
                    </TouchableOpacity>

                    {/* 바로 나가기 */}
                    <TouchableOpacity onPress={handleExit} style={[styles.iconButton, styles.exitBtn]}>
                        <Ionicons name="close" size={20} color="#C0392B" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* 기록 모달 연결 */}
            <GameRecordsModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                records={records}
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
        zIndex: 10,
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
        backgroundColor: '#FDEDEC',
        borderRadius: 20,
        padding: 4,
    },
    // 녹음 중일 때 스타일
    recordingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FDEDEC',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 12,
    },
    recordingText: {
        color: '#E74C3C',
        fontSize: 10,
        fontWeight: 'bold',
        marginLeft: 2
    },
});
