import GameHeader from "@/components/game/common/GameHeader";
import FlashlightOverlay from "@/components/game/mazeAdventure/FlashLightOverlay";
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

// [수정 1] 기본 셀 크기 상수명 변경
const BASE_GAME_CELL_SIZE = 170;
const BASE_VISIBLE_RADIUS = 1;

export default function MazeAdventurePlay() {
    const { gameId, level } = useLocalSearchParams();
    const { isPaused, isMuted } = useGameStore();

    const {
        loading, grid, items, playerPos, inventory, logs,
        inputText, setInputText, inputRef, submitCommand,
        trapState, timeLeft
    } = useMazeGame(Number(gameId), String(level));

    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

    const [isPreviewMode, setIsPreviewMode] = useState(true);
    const [previewCellSize, setPreviewCellSize] = useState(30); 
    const [previewTimer, setPreviewTimer] = useState(5); 

    const playerTranslateX = useSharedValue(0);
    const playerTranslateY = useSharedValue(0);
    const boardTranslateX = useSharedValue(0);
    const boardTranslateY = useSharedValue(0);

    // [수정 2] 손전등 레벨이 0보다 크면 30을 줄임 (Zoom Out 효과)
    const gameCellSize = inventory.flashlightLevel > 0 
        ? BASE_GAME_CELL_SIZE - 30 
        : BASE_GAME_CELL_SIZE;

    // 현재 모드에 따른 최종 셀 크기
    const currentCellSize = isPreviewMode ? previewCellSize : gameCellSize;

    const logStyleMap = {
        info: styles.logInfo,
        success: styles.logSuccess,
        error: styles.logError,
        warning: styles.logWarning,
    };

    const playSound = async (soundName: keyof typeof AUDIO_FILES) => {
        if (isMuted) return;
        try {
            const { sound } = await Audio.Sound.createAsync(AUDIO_FILES[soundName]);
            await sound.playAsync();
            sound.setOnPlaybackStatusUpdate(async (status) => {
                if (status.isLoaded && status.didJustFinish) {
                    await sound.unloadAsync();
                }
            });
        } catch (err) {
            console.log('Audio error: ', err);
        }
    };

    const prevPos = useRef(playerPos);
    const prevInventory = useRef(inventory);
    const prevLogsLen = useRef(0);
    const prevTrap = useRef<string | null>(null);

    useEffect(() => {
        if (loading || isPreviewMode) return; 

        if (prevPos.current.row !== playerPos.row || prevPos.current.col !== playerPos.col) {
            if (grid && grid[playerPos.row] && grid[playerPos.row][playerPos.col] === CELL_TYPE.EXIT) {
                playSound('correct');
            } else {
                playSound('walking');
            }
            prevPos.current = playerPos;
        }

        const gotKey = !prevInventory.current.hasKey && inventory.hasKey;
        const gotFlashlight = inventory.flashlightLevel > prevInventory.current.flashlightLevel;

        if (gotKey || gotFlashlight) {
            playSound('getItem');
        }
        prevInventory.current = inventory;

        if (!prevTrap.current && trapState) {
            playSound('trap');
        }
        prevTrap.current = trapState;

        if (logs.length > prevLogsLen.current) {
            const latestLog = logs[logs.length - 1];
            const text = latestLog.text.toLowerCase();
            if (text.includes('wall') || text.includes('blocked') || text.includes('bump')) playSound('bump');
            else if (text.includes('door') && (text.includes('open') || text.includes('unlocked'))) playSound('openDoor');
            else if (text.includes('flashlight') && (text.includes('use') || text.includes('active'))) playSound('useFlashlight');
            prevLogsLen.current = logs.length;
        }
    }, [playerPos, inventory, trapState, logs, loading, isPreviewMode]);

    useEffect(() => {
        if (!loading && grid && containerSize.width > 0) {
            const mapWidth = grid[0].length;
            const mapHeight = grid.length;
            const calcW = (containerSize.width - 40) / mapWidth;
            const calcH = (containerSize.height - 40) / mapHeight;
            const fitSize = Math.min(calcW, calcH);
            setPreviewCellSize(fitSize);

            const countdownInterval = setInterval(() => {
                setPreviewTimer((prev) => {
                    if (prev <= 1) {
                        clearInterval(countdownInterval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            const modeTimer = setTimeout(() => {
                setIsPreviewMode(false);
                prevLogsLen.current = logs.length;
            }, 5000);

            return () => {
                clearTimeout(modeTimer);
                clearInterval(countdownInterval);
            };
        }
    }, [loading, grid, containerSize]);

    // [수정 3] 의존성 배열에 gameCellSize 추가 및 로직 적용
    useEffect(() => {
        if (!loading && grid && containerSize.width > 0) {
            // isPreviewMode 여부에 따라 size 결정
            const size = isPreviewMode ? previewCellSize : gameCellSize;

            playerTranslateX.value = withTiming(playerPos.col * size, {
                duration: 500, easing: Easing.out(Easing.quad),
            });
            playerTranslateY.value = withTiming(playerPos.row * size, {
                duration: 500, easing: Easing.out(Easing.quad),
            });

            let targetBoardX = 0;
            let targetBoardY = 0;

            if (isPreviewMode) {
                const mapPixelWidth = grid[0].length * size;
                const mapPixelHeight = grid.length * size;
                targetBoardX = (containerSize.width - mapPixelWidth) / 2;
                targetBoardY = (containerSize.height - mapPixelHeight) / 2;
            } else {
                targetBoardX = (containerSize.width / 2) - (playerPos.col * size) - (size / 2);
                targetBoardY = (containerSize.height / 2) - (playerPos.row * size) - (size / 2);
            }

            boardTranslateX.value = withTiming(targetBoardX, { duration: 500 });
            boardTranslateY.value = withTiming(targetBoardY, { duration: 500 });
        }
        // [중요] gameCellSize가 변할 때마다 재계산해야 하므로 deps에 추가
    }, [playerPos, loading, grid, containerSize, isPreviewMode, previewCellSize, gameCellSize]);

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

    const scrollViewRef = useRef<ScrollView>(null);
    useEffect(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
    }, [logs]);

    const lightRadius = 200 + (inventory.flashlightLevel * 80);

    const renderCell = (cellValue: number, r: number, c: number) => {
        const distR = Math.abs(r - playerPos.row);
        const distC = Math.abs(c - playerPos.col);
        const renderDistance = BASE_VISIBLE_RADIUS + inventory.flashlightLevel + 3;

        if (!isPreviewMode && (distR > renderDistance || distC > renderDistance)) {
            return <View key={`${r}-${c}`} style={{ width: currentCellSize, height: currentCellSize, backgroundColor: '#000' }} />;
        }

        const item = items.find(i => i.row === r && i.col === c);
        const isWall = cellValue === CELL_TYPE.WALL;

        const wallDepth = currentCellSize * 0.15;
        const innerHeight = currentCellSize - wallDepth;

        if (isWall) {
            return (
                <View key={`${r}-${c}`} style={{ width: currentCellSize, height: currentCellSize }}>
                    <View style={{
                        width: currentCellSize,
                        height: innerHeight,
                        backgroundColor: '#58e666ff',
                        borderRadius: 4,
                        zIndex: 2
                    }} />
                    <View style={{
                        position: 'absolute',
                        bottom: 0,
                        width: currentCellSize,
                        height: wallDepth + 2,
                        backgroundColor: '#263e25ff', 
                        borderBottomLeftRadius: 4,
                        borderBottomRightRadius: 4,
                        zIndex: 1
                    }} />
                </View>
            );
        }

        return (
            <View key={`${r}-${c}`} style={[styles.cell, { width: currentCellSize, height: currentCellSize }, styles.cellPath]}>
                <View style={{ width: 4, height: 4, backgroundColor: '#464448ff', borderRadius: 2, opacity: 0.3 }} />

                {item && ( 
                    <Text style={{ fontSize: currentCellSize * 0.5 }}>
                        {item.type === 'KEY' && '🔑'}
                        {item.type === 'DOOR' && '🚪'}
                        {item.type === 'FLASHLIGHT' && '🔦'}

                        {(isPreviewMode || trapState) && item.type === 'TRAP_GHOST' && '👻'}
                        {(isPreviewMode || trapState) && item.type === 'TRAP_HOLE' && '🕳️'}
                    </Text>
                )}
                {cellValue === CELL_TYPE.EXIT && <Text style={{ fontSize: currentCellSize * 0.6 }}>🏁</Text>}
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

                <View style={styles.mazeContainer} onLayout={(e) => setContainerSize(e.nativeEvent.layout)}>
                    <Animated.View style={[styles.gridBoard, animatedBoardStyle]}>
                        {grid.map((row, r) => (
                            <View key={r} style={styles.row}>
                                {row.map((cell, c) => renderCell(cell, r, c))}
                            </View>
                        ))}
                        <Animated.View style={[styles.playerEntity, animatedPlayerStyle]}>
                            <View style={{
                                position: 'absolute', bottom: 2, width: '60%', height: 6,
                                backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 10
                            }} />
                            <Text style={{ fontSize: currentCellSize * 0.7, marginBottom: 5 }}>
                                {trapState === 'TRAP_GHOST' ? '😱' : '🤠'}
                            </Text>
                        </Animated.View>
                    </Animated.View>

                    {!isPreviewMode && (
                        <FlashlightOverlay radius={lightRadius} />
                    )}
                    {isPaused && <View style={styles.pauseOverlay}><Text style={styles.pauseText}>PAUSED</Text></View>}
                </View>

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
    safeArea: { flex: 1, backgroundColor: '#1A122E' }, 
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
        flex: 3, backgroundColor: '#f7f7f8ff', 
        overflow: 'hidden',
    },
    gridBoard: { position: 'absolute', top: 0, left: 0 },
    row: { flexDirection: 'row' },

    cell: { justifyContent: 'center', alignItems: 'center' },
    cellPath: {
        backgroundColor: '#9bb865ff', 
        borderWidth: 0.5, borderColor: '#3D2C63' 
    },
    cellFog: { backgroundColor: '#1A122E' },

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
