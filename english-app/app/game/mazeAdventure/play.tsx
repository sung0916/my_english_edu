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

// 게임 중 셀 크기 (확대 모드)
const GAME_CELL_SIZE = 75;
const BASE_VISIBLE_RADIUS = 1;

export default function MazeAdventurePlay() {
    const { gameId, level } = useLocalSearchParams();
    const { isPaused } = useGameStore();

    const {
        loading, grid, items, playerPos, inventory, logs,
        inputText, setInputText, submitCommand,
        trapState, timeLeft
    } = useMazeGame(Number(gameId), String(level));

    // 화면 크기
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    
    // [추가 1] 프리뷰 모드 상태 (True: 전체보기, False: 게임시작)
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

    // [추가 2] 프리뷰 모드 타이머 및 셀 크기 계산
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
            }, 5000);

            return () => {
                clearTimeout(modeTimer);
                clearInterval(countdownInterval);
            };
        }
    }, [loading, grid, containerSize]);

    // [수정] 애니메이션 로직 (모드에 따라 타겟 위치가 다름)
    useEffect(() => {
        if (!loading && grid && containerSize.width > 0) {
            // 현재 모드에 맞는 셀 크기 사용
            const size = isPreviewMode ? previewCellSize : GAME_CELL_SIZE;

            // 1. 플레이어 이동
            playerTranslateX.value = withTiming(playerPos.col * size, {
                duration: 500, easing: Easing.out(Easing.quad),
            });
            playerTranslateY.value = withTiming(playerPos.row * size, {
                duration: 500, easing: Easing.out(Easing.quad),
            });

            // 2. 보드 이동 (카메라)
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

    // [수정] 셀 렌더링 (포그 & 함정 표시 로직 변경)
    const renderCell = (cellValue: number, rowIndex: number, colIndex: number) => {
        const distRow = Math.abs(rowIndex - playerPos.row);
        const distCol = Math.abs(colIndex - playerPos.col);
        const isVisible = distRow <= currentRadius && distCol <= currentRadius;

        // 1. 안개 로직: 프리뷰 모드가 아니고, 시야 밖일 때만 안개 처리
        if (!isPreviewMode && !isVisible) {
            return <View key={`${rowIndex}-${colIndex}`} style={[styles.cell, { width: currentCellSize, height: currentCellSize }, styles.cellFog]} />;
        }

        const itemAtCell = items.find(i => i.row === rowIndex && i.col === colIndex);
        let cellStyle = styles.cellPath;
        if (cellValue === CELL_TYPE.WALL) cellStyle = styles.cellWall;
        if (cellValue === CELL_TYPE.EXIT) cellStyle = styles.cellExit;

        return (
            <View key={`${rowIndex}-${colIndex}`} style={[styles.cell, { width: currentCellSize, height: currentCellSize }, cellStyle]}>
                {itemAtCell && (
                    <Text style={[styles.icon, { fontSize: currentCellSize * 0.6 }]}>
                        {itemAtCell.type === 'KEY' && '🔑'}
                        {itemAtCell.type === 'DOOR' && '🚪'}
                        {itemAtCell.type === 'FLASHLIGHT' && '🔦'}
                        
                        {/* [추가 3] 프리뷰 모드일 때만 함정 위치 보여줌 */}
                        {isPreviewMode && itemAtCell.type === 'TRAP_GHOST' && '👻'}
                        {isPreviewMode && itemAtCell.type === 'TRAP_HOLE' && '🕳️'}
                    </Text>
                )}
                {cellValue === CELL_TYPE.EXIT && <Text style={[styles.icon, { fontSize: currentCellSize * 0.6 }]}>🏁</Text>}
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
                    
                    {/* [추가 4] 프리뷰 타이머 or 함정 경고 */}
                    {isPreviewMode ? (
                        <View style={styles.previewBadge}>
                            <Text style={styles.previewText}>Memorize! {previewTimer}s</Text>
                        </View>
                    ) : trapState ? (
                        <View style={styles.trapAlert}>
                            <Text style={styles.trapText}>TRAP! {timeLeft}s</Text>
                        </View>
                    ) : null}
                </View>

                <View 
                    style={styles.mazeContainer}
                    onLayout={(event) => {
                        const { width, height } = event.nativeEvent.layout;
                        setContainerSize({ width, height });
                    }}
                >
                    <Animated.View style={[styles.gridBoard, animatedBoardStyle]}>
                        {grid.map((row, rIndex) => (
                            <View key={rIndex} style={styles.row}>
                                {row.map((cell, cIndex) => renderCell(cell, rIndex, cIndex))}
                            </View>
                        ))}

                        <Animated.View style={[styles.playerEntity, animatedPlayerStyle]}>
                            <Text style={[styles.playerIcon, { fontSize: currentCellSize * 0.7 }]}>
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

                {/* [추가 5] 프리뷰 모드일 때는 입력창 비활성화 */}
                <View style={[styles.inputContainer, trapState && styles.inputTrap]}>
                    <Text style={styles.prompt}>&gt;</Text>
                    <TextInput
                        style={styles.input}
                        value={inputText}
                        onChangeText={setInputText}
                        onSubmitEditing={submitCommand}
                        placeholder={
                            isPreviewMode ? "Wait for game start..." :
                            trapState ? `Type '${trapState === 'TRAP_GHOST' ? 'run' : 'jump'}'!` : "Enter command..."
                        }
                        placeholderTextColor="#94A3B8"
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={!isPaused && !isPreviewMode}
                        returnKeyType="send"
                        blurOnSubmit={false}
                    />
                    <Ionicons name="return-down-back" size={24} color={isPreviewMode ? "#64748B" : "#0EA5E9"} onPress={submitCommand} style={{ marginLeft: 10 }} />
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
        height: 50, // 높이 고정 (레이아웃 흔들림 방지)
    },
    inventoryGroup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    infoLabel: { color: '#94A3B8', fontWeight: 'bold', marginRight: 5 },
    invItem: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5, backgroundColor: '#334155', opacity: 0.3 },
    invActive: { opacity: 1, backgroundColor: '#0EA5E9' },
    invText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
    
    trapAlert: { backgroundColor: '#EF4444', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 5 },
    trapText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
    
    // 프리뷰 배지 스타일
    previewBadge: { backgroundColor: '#F59E0B', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 5 },
    previewText: { color: 'white', fontWeight: 'bold', fontSize: 14 },

    mazeContainer: {
        flex: 2, 
        backgroundColor: '#000', 
        position: 'relative',
        overflow: 'hidden',
    },
    gridBoard: {
        backgroundColor: '#1E293B',
    },
    row: { flexDirection: 'row' },
    cell: {
        // width, height는 인라인 스타일로 제어됨
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 0.5, borderColor: '#334155',
    },
    cellFog: { backgroundColor: '#000' },
    cellPath: { backgroundColor: '#F1F5F9' },
    cellWall: { backgroundColor: '#0F172A' },
    cellExit: { backgroundColor: '#10B981' },
    
    // 아이콘 크기도 인라인 스타일로 제어
    icon: { textAlign: 'center' }, 

    playerEntity: {
        position: 'absolute',
        // width, height는 인라인 스타일로 제어됨
        justifyContent: 'center', alignItems: 'center',
        zIndex: 10,
    },
    playerIcon: { textAlign: 'center' },

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
