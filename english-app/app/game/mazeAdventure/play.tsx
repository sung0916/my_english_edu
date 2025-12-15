import GameHeader from "@/components/game/common/GameHeader";
import useMazeGame from "@/hooks/game/useMazeGame";
import { useGameStore } from "@/store/gameStore";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Easing, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const CELL_TYPE = { PATH: 0, WALL: 1, START: 2, EXIT: 3 };
const CELL_SIZE = 75; 
const BASE_VISIBLE_RADIUS = 1;

export default function MazeAdventurePlay() {
    const { gameId, level } = useLocalSearchParams();
    const { isPaused } = useGameStore();

    const {
        loading, grid, items, playerPos, inventory, logs,
        inputText, setInputText, submitCommand,
        trapState, timeLeft
    } = useMazeGame(Number(gameId), String(level));

    // [변경 2] 컨테이너(화면)의 크기를 저장할 상태
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

    // 1. 플레이어의 그리드 내 위치 (기존 동일)
    const playerTranslateX = useSharedValue(0);
    const playerTranslateY = useSharedValue(0);

    // 2. 보드(맵) 전체의 위치 (카메라 역할)
    const boardTranslateX = useSharedValue(0);
    const boardTranslateY = useSharedValue(0);

    useEffect(() => {
        if (!loading && grid && containerSize.width > 0) {
            // A. 플레이어 아이콘을 해당 셀 위치로 이동 (그리드 기준)
            playerTranslateX.value = withTiming(playerPos.col * CELL_SIZE, {
                duration: 300, easing: Easing.out(Easing.quad),
            });
            playerTranslateY.value = withTiming(playerPos.row * CELL_SIZE, {
                duration: 300, easing: Easing.out(Easing.quad),
            });

            // B. 보드 전체를 반대로 이동시켜 플레이어가 화면 중앙에 오도록 함 (Camera Follow)
            // 목표 위치 = (화면반절) - (플레이어좌표) - (플레이어크기반절)
            const targetBoardX = (containerSize.width / 2) - (playerPos.col * CELL_SIZE) - (CELL_SIZE / 2);
            const targetBoardY = (containerSize.height / 2) - (playerPos.row * CELL_SIZE) - (CELL_SIZE / 2);

            boardTranslateX.value = withTiming(targetBoardX, {
                duration: 300, easing: Easing.out(Easing.quad),
            });
            boardTranslateY.value = withTiming(targetBoardY, {
                duration: 300, easing: Easing.out(Easing.quad),
            });
        }
    }, [playerPos, loading, grid, containerSize]);

    // 플레이어 애니메이션 스타일
    const animatedPlayerStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: playerTranslateX.value },
            { translateY: playerTranslateY.value }
        ]
    }));

    // [변경 3] 보드(카메라) 애니메이션 스타일
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

    const currentRadius = BASE_VISIBLE_RADIUS + inventory.flashlightLevel;

    // 셀 렌더링
    const renderCell = (cellValue: number, rowIndex: number, colIndex: number) => {
        const distRow = Math.abs(rowIndex - playerPos.row);
        const distCol = Math.abs(colIndex - playerPos.col);
        const isVisible = distRow <= currentRadius && distCol <= currentRadius;

        if (!isVisible) {
            return <View key={`${rowIndex}-${colIndex}`} style={[styles.cell, styles.cellFog]} />;
        }

        const itemAtCell = items.find(i => i.row === rowIndex && i.col === colIndex);
        let cellStyle = styles.cellPath;
        if (cellValue === CELL_TYPE.WALL) cellStyle = styles.cellWall;
        if (cellValue === CELL_TYPE.EXIT) cellStyle = styles.cellExit;

        return (
            <View key={`${rowIndex}-${colIndex}`} style={[styles.cell, cellStyle]}>
                {itemAtCell && (
                    <Text style={styles.icon}>
                        {itemAtCell.type === 'KEY' && '🔑'}
                        {itemAtCell.type === 'DOOR' && '🚪'}
                        {itemAtCell.type === 'FLASHLIGHT' && '🔦'}
                    </Text>
                )}
                {cellValue === CELL_TYPE.EXIT && <Text style={styles.icon}>🏁</Text>}
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

            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                style={styles.container}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
            >
                <View style={styles.infoBar}>
                    <View style={styles.inventoryGroup}>
                        <Text style={styles.infoLabel}>Inventory:</Text>
                        <View style={[styles.invItem, inventory.hasKey && styles.invActive]}>
                            <Text style={styles.invText}>🔑 Key</Text>
                        </View>
                        <View style={[styles.invItem, inventory.flashlightLevel > 0 && styles.invActive]}>
                            <Text style={styles.invText}>🔦 Light Lv.{inventory.flashlightLevel}</Text>
                        </View>
                    </View>
                    {trapState && (
                        <View style={styles.trapAlert}>
                            <Text style={styles.trapText}>TRAP! {timeLeft}s</Text>
                        </View>
                    )}
                </View>

                {/* [변경 4] 미로 컨테이너에 onLayout 추가하여 화면 크기 계산 */}
                <View 
                    style={styles.mazeContainer}
                    onLayout={(event) => {
                        const { width, height } = event.nativeEvent.layout;
                        setContainerSize({ width, height });
                    }}
                >
                    {/* [변경 5] 그리드 전체를 감싸는 Animated View (카메라 이동용) */}
                    <Animated.View style={[styles.gridBoard, animatedBoardStyle]}>
                        {grid.map((row, rIndex) => (
                            <View key={rIndex} style={styles.row}>
                                {row.map((cell, cIndex) => renderCell(cell, rIndex, cIndex))}
                            </View>
                        ))}

                        <Animated.View style={[styles.playerEntity, animatedPlayerStyle]}>
                            <Text style={styles.playerIcon}>
                                {trapState === 'TRAP_GHOST' ? '😱' : '🤠'}
                            </Text>
                        </Animated.View>
                    </Animated.View>
                    
                    {isPaused && (
                        <View style={styles.pauseOverlay}>
                            <Text style={styles.pauseText}>PAUSED</Text>
                        </View>
                    )}
                </View>

                <View style={styles.terminalContainer}>
                    <ScrollView ref={scrollViewRef} style={styles.logList}>
                        {logs.map((log, index) => (
                            <Text key={index} style={[
                                styles.logText, 
                                log.type === 'error' && styles.logError,
                                log.type === 'success' && styles.logSuccess,
                                log.type === 'info' && styles.logInfo,
                                log.type === 'warning' && styles.logWarning
                            ]}>
                                {log.text}
                            </Text>
                        ))}
                    </ScrollView>
                </View>

                <View style={[styles.inputContainer, trapState && styles.inputTrap]}>
                    <Text style={styles.prompt}>&gt;</Text>
                    <TextInput
                        style={styles.input}
                        value={inputText}
                        onChangeText={setInputText}
                        onSubmitEditing={submitCommand}
                        placeholder={trapState ? `Type '${trapState === 'TRAP_GHOST' ? 'run' : 'jump'}'!` : "Enter command..."}
                        placeholderTextColor="#94A3B8"
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={!isPaused}
                        returnKeyType="send"
                        blurOnSubmit={false}
                    />
                    <Ionicons name="return-down-back" size={24} color="#0EA5E9" onPress={submitCommand} style={{ marginLeft: 10 }} />
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#0F172A' },
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    infoBar: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: 10, backgroundColor: '#1E293B', borderBottomWidth: 1, borderColor: '#334155',
    },
    inventoryGroup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    infoLabel: { color: '#94A3B8', fontWeight: 'bold', marginRight: 5 },
    invItem: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5, backgroundColor: '#334155', opacity: 0.3 },
    invActive: { opacity: 1, backgroundColor: '#0EA5E9' },
    invText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
    trapAlert: { backgroundColor: '#EF4444', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 5 },
    trapText: { color: 'white', fontWeight: 'bold', fontSize: 14 },

    mazeContainer: {
        flex: 2, 
        backgroundColor: '#000', 
        position: 'relative',
        overflow: 'hidden', // [중요] 그리드가 화면 밖으로 나가도 잘리도록 설정
    },
    gridBoard: {
        // center 정렬 제거 -> 애니메이션으로 위치 잡음
        // position: 'absolute'는 필요 없음 (Transform으로 제어)
        backgroundColor: '#1E293B',
    },
    row: { flexDirection: 'row' },
    cell: {
        width: CELL_SIZE, height: CELL_SIZE, // 75로 확대됨
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 0.5, borderColor: '#334155',
    },
    cellFog: { backgroundColor: '#000' },
    cellPath: { backgroundColor: '#F1F5F9' },
    cellWall: { backgroundColor: '#0F172A' },
    cellExit: { backgroundColor: '#10B981' },
    
    // 아이콘 크기도 셀 크기에 맞춰서 키워줍니다.
    icon: { fontSize: 32 }, 

    playerEntity: {
        position: 'absolute',
        width: CELL_SIZE, height: CELL_SIZE,
        justifyContent: 'center', alignItems: 'center',
        zIndex: 10,
    },
    playerIcon: { fontSize: 40 }, // 플레이어도 크게

    terminalContainer: {
        flex: 1, backgroundColor: '#1E293B', borderTopWidth: 1, borderColor: '#334155', padding: 10,
    },
    logList: { flex: 1 },
    logText: { fontSize: 14, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', marginBottom: 4 },
    logInfo: { color: '#E2E8F0' },
    logSuccess: { color: '#4ADE80' },
    logError: { color: '#F87171' },
    logWarning: { color: '#FBBF24' },

    inputContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A',
        paddingHorizontal: 15, paddingVertical: 12, borderTopWidth: 1, borderColor: '#334155',
    },
    inputTrap: { borderColor: '#EF4444', borderWidth: 2 },
    prompt: { color: '#4ADE80', fontSize: 18, marginRight: 10, fontWeight: 'bold' },
    input: { flex: 1, color: 'white', fontSize: 16, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
    pauseOverlay: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', zIndex: 20,
    },
    pauseText: { color: 'white', fontSize: 24, fontWeight: 'bold' },
});
