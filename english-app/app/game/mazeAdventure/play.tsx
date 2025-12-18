import GameHeader from "@/components/game/common/GameHeader";
import useMazeGame from "@/hooks/game/useMazeGame";
import { useGameStore } from "@/store/gameStore";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Easing, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const AUDIO_FILES = {
    bump: require('@/assets/audio/game/maze/bump.mp3'),
    getItem: require('@/assets/audio/game/maze/getItem.mp3'),
    openDoor: require('@/assets/audio/game/maze/openDoor.mp3'),
    trap: require('@/assets/audio/game/maze/trap.mp3'),
    useFlashlight: require('@/assets/audio/game/maze/useFlashlight.mp3'),
    walking: require('@/assets/audio/game/maze/walking.mp3'),
    correct: require('@/assets/audio/game/correct.mp3'),
};

const CELL_TYPE = { PATH: 0, WALL: 1, START: 2, EXIT: 3 };

// 게임 중 셀 크기 (확대 모드)
const GAME_CELL_SIZE = 90;
const BASE_VISIBLE_RADIUS = 1;

export default function MazeAdventurePlay() {
    const { gameId, level } = useLocalSearchParams();
    const { isPaused, isMuted } = useGameStore();

    const {
        loading, grid, items, playerPos, inventory, logs,
        inputText, setInputText, inputRef, submitCommand,
        trapState, timeLeft
    } = useMazeGame(Number(gameId), String(level));

    // 화면 크기
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

    // 프리뷰 모드 상태 (True: 전체보기, False: 게임시작)
    const [isPreviewMode, setIsPreviewMode] = useState(true);
    const [previewCellSize, setPreviewCellSize] = useState(30); // 계산 전 기본값
    const [previewTimer, setPreviewTimer] = useState(5); // 카운트다운 표시용

    // 애니메이션 값
    const playerTranslateX = useSharedValue(0);
    const playerTranslateY = useSharedValue(0);
    const boardTranslateX = useSharedValue(0);
    const boardTranslateY = useSharedValue(0);

    // 현재 적용할 셀 크기 (모드에 따라 변경)
    const currentCellSize = isPreviewMode ? previewCellSize : GAME_CELL_SIZE;

    // 로그 타입에 따른 스타일 매핑 객체
    const logStyleMap = {
        info: styles.logInfo,
        success: styles.logSuccess,
        error: styles.logError,
        warning: styles.logWarning,
    };


    // 소리 재생 함수
    const playSound = async (soundName: keyof typeof AUDIO_FILES) => {
        if (isMuted) return;

        try {
            const { sound } = await Audio.Sound.createAsync(AUDIO_FILES[soundName]);
            await sound.playAsync();

            // 재생 완료 후 메모리 해제
            sound.setOnPlaybackStatusUpdate(async (status) => {
                if (status.isLoaded && status.didJustFinish) {
                    await sound.unloadAsync();
                }
            });

        } catch (err) {
            console.log('Audio error: ', err);
        }
    };

    // 상태 추적 Refs (이전 값과 비교)
    const prevPos = useRef(playerPos);
    const prevInventory = useRef(inventory);
    const prevLogsLen = useRef(0);
    const prevTrap = useRef<string | null>(null);

    // 오디오 트리거
    useEffect(() => {
        if (loading || isPreviewMode) return; // 로딩 중이나 프리뷰 땐 소리 끔

        // A. 이동 (Walking) - 좌표가 바뀌었을 때
        if (prevPos.current.row !== playerPos.row || prevPos.current.col !== playerPos.col) {

            if (grid && grid[playerPos.row] && grid[playerPos.row][playerPos.col] === CELL_TYPE.EXIT) {
                playSound('correct');
            } else {
                playSound('walking');
            }

            prevPos.current = playerPos;
        }

        // B. 아이템 획득 (Get Item) - 인벤토리 상태 변화 감지
        const gotKey = !prevInventory.current.hasKey && inventory.hasKey;
        const gotFlashlight = inventory.flashlightLevel > prevInventory.current.flashlightLevel;

        if (gotKey || gotFlashlight) {
            // ※ 만약 "사용(Use)"해서 레벨이 오른게 아니라 "줍줍"해서 오른거라면 여기서 재생
            // 손전등 사용 로직은 아래 로그 기반에서 처리하거나 여기서 분기 처리
            playSound('getItem');
        }
        prevInventory.current = inventory;

        // C. 함정 발동 (Trap)
        if (!prevTrap.current && trapState) {
            playSound('trap');
        }
        prevTrap.current = trapState;

        // D. 로그 기반 트리거 (Bump, OpenDoor, UseFlashlight)
        // 상태값만으로 알기 힘든 이벤트는 로그 텍스트를 분석해서 처리
        if (logs.length > prevLogsLen.current) {
            const latestLog = logs[logs.length - 1];
            const text = latestLog.text.toLowerCase();

            // 1. 벽 충돌 (Bump)
            if (text.includes('wall') || text.includes('blocked') || text.includes('bump')) {
                playSound('bump');
            }
            // 2. 문 열기 (Open Door)
            else if (text.includes('door') && (text.includes('open') || text.includes('unlocked'))) {
                playSound('openDoor');
            }
            // 3. 손전등 사용 (Use Flashlight)
            // 인벤토리 레벨업과 겹칠 수 있으니 로직에 따라 조정 필요
            else if (text.includes('flashlight') && (text.includes('use') || text.includes('active'))) {
                playSound('useFlashlight');
            }

            prevLogsLen.current = logs.length;
        }
    }, [playerPos, inventory, trapState, logs, loading, isPreviewMode]);

    // 프리뷰 모드 타이머 및 셀 크기 계산
    useEffect(() => {
        if (!loading && grid && containerSize.width > 0) {
            // A. 프리뷰용 셀 크기 계산 (화면에 꽉 차게)
            const mapWidth = grid[0].length;
            const mapHeight = grid.length;

            // 가로/세로 중 더 꽉 차는 비율로 맞춤 (여백 약간 둠)
            const calcW = (containerSize.width - 40) / mapWidth;
            const calcH = (containerSize.height - 40) / mapHeight;
            const fitSize = Math.min(calcW, calcH);
            setPreviewCellSize(fitSize);

            // B. 5초 카운트다운 로직
            const countdownInterval = setInterval(() => {
                setPreviewTimer((prev) => {
                    if (prev <= 1) {
                        clearInterval(countdownInterval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            // C. 5초 후 게임 모드 전환
            const modeTimer = setTimeout(() => {
                setIsPreviewMode(false);

                // 게임 시작 시 로그 길이 싱크 맞춰서 불필요한 소리 방지
                prevLogsLen.current = logs.length;
            }, 5000);

            return () => {
                clearTimeout(modeTimer);
                clearInterval(countdownInterval);
            };
        }
    }, [loading, grid, containerSize]);

    // 애니메이션 로직 (모드에 따라 타겟 위치가 다름)
    useEffect(() => {
        if (!loading && grid && containerSize.width > 0) {
            // 현재 모드에 맞는 셀 크기 사용
            const size = isPreviewMode ? previewCellSize : GAME_CELL_SIZE;

            // 플레이어 이동
            playerTranslateX.value = withTiming(playerPos.col * size, {
                duration: 500, easing: Easing.out(Easing.quad),
            });
            playerTranslateY.value = withTiming(playerPos.row * size, {
                duration: 500, easing: Easing.out(Easing.quad),
            });

            // 보드 이동 (카메라)
            let targetBoardX = 0;
            let targetBoardY = 0;

            if (isPreviewMode) {
                // 프리뷰: 화면 중앙 정렬
                const mapPixelWidth = grid[0].length * size;
                const mapPixelHeight = grid.length * size;
                targetBoardX = (containerSize.width - mapPixelWidth) / 2;
                targetBoardY = (containerSize.height - mapPixelHeight) / 2;
            } else {
                // 게임모드: 플레이어 팔로우
                targetBoardX = (containerSize.width / 2) - (playerPos.col * size) - (size / 2);
                targetBoardY = (containerSize.height / 2) - (playerPos.row * size) - (size / 2);
            }

            boardTranslateX.value = withTiming(targetBoardX, { duration: 500 });
            boardTranslateY.value = withTiming(targetBoardY, { duration: 500 });
        }
    }, [playerPos, loading, grid, containerSize, isPreviewMode, previewCellSize]);

    // 스타일
    const animatedPlayerStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: playerTranslateX.value },
            { translateY: playerTranslateY.value }
        ],
        width: currentCellSize,
        height: currentCellSize,
    }));

    const animatedBoardStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: boardTranslateX.value },
            { translateY: boardTranslateY.value }
        ]
    }));

    // 로그 스크롤
    const scrollViewRef = useRef<ScrollView>(null);
    useEffect(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
    }, [logs]);

    const currentRadius = BASE_VISIBLE_RADIUS + inventory.flashlightLevel;

    // 셀 렌더링 (포그 & 함정 표시 로직 변경)
    const renderCell = (cellValue: number, r: number, c: number) => {
        const distR = Math.abs(r - playerPos.row);
        const distC = Math.abs(c - playerPos.col);
        const isVisible = distR <= currentRadius && distC <= currentRadius;

        // 안개 로직: 프리뷰 모드가 아니고, 시야 밖일 때만 안개 처리
        if (!isPreviewMode && !isVisible) {
            return <View key={`${r}-${c}`} style={[styles.cell, { width: currentCellSize, height: currentCellSize }, styles.cellFog]} />;
        }

        const item = items.find(i => i.row === r && i.col === c);
        const isWall = cellValue === CELL_TYPE.WALL;

        const wallDepth = currentCellSize * 0.15;
        const innerHeight = currentCellSize - wallDepth;

        if (isWall) {
            return (
                <View key={`${r}-${c}`} style={{ width: currentCellSize, height: currentCellSize }}>
                    {/* 벽의 윗면 */}
                    <View style={{
                        width: currentCellSize,
                        height: innerHeight,
                        backgroundColor: '#FF9F1C', // 밝은 주황
                        borderRadius: 4,
                        zIndex: 2
                    }} />
                    {/* 벽의 옆면 (그림자/두께 역할) */}
                    <View style={{
                        position: 'absolute',
                        bottom: 0,
                        width: currentCellSize,
                        height: wallDepth + 2, // 약간 겹치게
                        backgroundColor: '#C05600', // 어두운 주황
                        borderBottomLeftRadius: 4,
                        borderBottomRightRadius: 4,
                        zIndex: 1
                    }} />
                </View>
            );
        }

        // 바닥 그리기 (PATH, START, EXIT 모두 여기로 옴)
        return (
            <View key={`${r}-${c}`} style={[styles.cell, { width: currentCellSize, height: currentCellSize }, styles.cellPath]}>
                
                {/* 바닥 패턴 */}
                <View style={{ width: 4, height: 4, backgroundColor: '#3D2C63', borderRadius: 2, opacity: 0.3 }} />

                {item && (
                    <Text style={{ fontSize: currentCellSize * 0.5 }}>
                        {item.type === 'KEY' && '🔑'}
                        {item.type === 'DOOR' && '🚪'}
                        {item.type === 'FLASHLIGHT' && '🔦'}

                        {(isPreviewMode || trapState) && item.type === 'TRAP_GHOST' && '👻'}
                        {(isPreviewMode || trapState) && item.type === 'TRAP_HOLE' && '🕳️'}
                    </Text>
                )}
                
                {/* [수정] EXIT일 때 깃발 표시 (배경은 바닥임) */}
                {cellValue === CELL_TYPE.EXIT && <Text style={{ fontSize: currentCellSize * 0.6 }}>🏁</Text>}
                
                {/* (선택) START일 때 발자국 등을 표시하고 싶다면 추가 */}
                {/* {cellValue === CELL_TYPE.START && <Text>👣</Text>} */}
            </View>
        );
    };

    if (loading || !grid) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <GameHeader />
                <View style={styles.center}><ActivityIndicator size="large" color="#0EA5E9" /></View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <GameHeader />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>

                {/* 상단 정보바 */}
                <View style={styles.infoBar}>
                    <View style={styles.inventoryGroup}>
                        <View style={[styles.invItem, inventory.hasKey && styles.invActive]}>
                            <Text style={styles.invText}>🔑 Key</Text>
                        </View>
                        <View style={[styles.invItem, inventory.flashlightLevel > 0 && styles.invActive]}>
                            <Text style={styles.invText}>🔦 Lv.{inventory.flashlightLevel}</Text>
                        </View>
                    </View>
                    {isPreviewMode ? (
                        <View style={styles.previewBadge}><Text style={styles.previewText}>Memorize! {previewTimer}s</Text></View>
                    ) : trapState && (
                        <View style={styles.trapAlert}><Text style={styles.trapText}>TRAP! {timeLeft}s</Text></View>
                    )}
                </View>

                {/* 게임 보드 */}
                <View style={styles.mazeContainer} onLayout={(e) => setContainerSize(e.nativeEvent.layout)}>
                    <Animated.View style={[styles.gridBoard, animatedBoardStyle]}>
                        {grid.map((row, r) => (
                            <View key={r} style={styles.row}>
                                {row.map((cell, c) => renderCell(cell, r, c))}
                            </View>
                        ))}
                        {/* 캐릭터 */}
                        <Animated.View style={[styles.playerEntity, animatedPlayerStyle]}>
                            {/* 캐릭터 그림자 */}
                            <View style={{
                                position: 'absolute', bottom: 2, width: '60%', height: 6,
                                backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 10
                            }} />
                            {/* 캐릭터 본체 */}
                            <Text style={{ fontSize: currentCellSize * 0.7, marginBottom: 5 }}>
                                {trapState === 'TRAP_GHOST' ? '😱' : '🤠'}
                            </Text>
                        </Animated.View>
                    </Animated.View>

                    {isPaused && <View style={styles.pauseOverlay}><Text style={styles.pauseText}>PAUSED</Text></View>}
                </View>

                {/* 로그 및 입력 */}
                <View style={styles.terminalContainer}>
                    <ScrollView ref={scrollViewRef} style={styles.logList}>
                        {logs.map((l, i) => (
                            <Text key={i} style={[
                                styles.logText,
                                logStyleMap[l.type] 
                            ]}>
                                {l.text}
                            </Text>
                        ))}
                    </ScrollView>
                </View>

                <View style={[styles.inputContainer, trapState && styles.inputTrap]}>
                    <Text style={styles.prompt}>&gt;</Text>
                    <TextInput
                        ref = {inputRef}
                        style={styles.input}
                        value={inputText}
                        onChangeText={setInputText}
                        onSubmitEditing={() => {
                            submitCommand();
                            setTimeout(() => inputRef.current?.focus(), 10);
                        }}
                        placeholder={isPreviewMode ? "Game starting..." : trapState ? "TRAP ACTIVE!" : "Enter command..."}
                        placeholderTextColor="#64748B"
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={!isPaused && !isPreviewMode}
                        returnKeyType="send"
                        blurOnSubmit={false}
                    />
                    <Ionicons name="arrow-up-circle" size={32} color="#0EA5E9" onPress={submitCommand} />
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#1A122E' }, // 전체 배경: 아주 어두운 보라
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    infoBar: {
        flexDirection: 'row', justifyContent: 'space-between', padding: 12,
        backgroundColor: '#2D1B4E', borderBottomWidth: 2, borderColor: '#4527A0'
    },
    inventoryGroup: { flexDirection: 'row', gap: 8 },
    invItem: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: '#4527A0', opacity: 0.4 },
    invActive: { opacity: 1, backgroundColor: '#FF9F1C' },
    invText: { color: 'white', fontWeight: 'bold', fontSize: 12 },

    mazeContainer: {
        flex: 3, backgroundColor: '#2D1B4E', // 바닥색 (Deep Purple)
        overflow: 'hidden',
    },
    gridBoard: { position: 'absolute', top: 0, left: 0 },
    row: { flexDirection: 'row' },

    // Cell Styles
    cell: { justifyContent: 'center', alignItems: 'center' },
    cellPath: {
        backgroundColor: '#4C3575', // 이동 가능한 길 (조금 밝은 보라)
        borderWidth: 0.5, borderColor: '#3D2C63' // 타일 경계
    },
    cellFog: { backgroundColor: '#1A122E' }, // 안개는 전체 배경색과 동일하게

    // UI Elements
    previewBadge: { backgroundColor: '#F59E0B', padding: 5, borderRadius: 5 },
    previewText: { color: 'white', fontWeight: 'bold' },
    trapAlert: { backgroundColor: '#EF4444', padding: 5, borderRadius: 5 },
    trapText: { color: 'white', fontWeight: 'bold' },

    playerEntity: { position: 'absolute', justifyContent: 'center', alignItems: 'center', zIndex: 100 },

    terminalContainer: {
        flex: 1, backgroundColor: '#0F172A', padding: 10,
        borderTopWidth: 2, borderColor: '#334155'
    },
    logList: { flex: 1 },
    logText: { fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontSize: 13, marginBottom: 3, color: '#CBD5E1' },
    logInfo: { color: '#94A3B8' },
    logSuccess: { color: '#4ADE80' },
    logError: { color: '#F87171' },
    logWarning: { color: '#FBBF24' },

    inputContainer: {
        flexDirection: 'row', alignItems: 'center', padding: 10,
        backgroundColor: '#1E293B', borderTopWidth: 1, borderColor: '#334155'
    },
    inputTrap: { borderColor: '#EF4444', borderWidth: 2 },
    prompt: { color: '#4ADE80', fontSize: 20, fontWeight: 'bold', marginRight: 10 },
    input: { flex: 1, color: 'white', fontSize: 16, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },

    pauseOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', zIndex: 999 },
    pauseText: { color: 'white', fontSize: 30, fontWeight: 'bold', letterSpacing: 2 },
});
