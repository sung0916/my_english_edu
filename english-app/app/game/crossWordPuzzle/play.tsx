import { CrosswordData, fetchGameContent, submitGameScore } from "@/api/gameApi";
import GameHeader from "@/components/game/common/GameHeader";
import { useGameStore } from "@/store/gameStore";
import { useUserStore } from "@/store/userStore";
import { crossPlatformAlert } from "@/utils/crossPlatformAlert";
import { Audio } from "expo-av";
import { useLocalSearchParams, useNavigation, usePathname, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, DimensionValue, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from "react-native";

const GAME_ID = 4;
const LEVEL_MAP: Record<string, string> = {
    '1': 'FIRST', '2': 'SECOND', '3': 'THIRD', '4': 'FOURTH', '5': 'FIFTH',
};

export default function CrosswordPuzzleGame() {
    const router = useRouter();
    const { level } = useLocalSearchParams<{ level: string }>();
    const { user } = useUserStore();
    const { isPaused, setIsPlaying, resetGame } = useGameStore();
    const { width: windowWidth } = useWindowDimensions();
    const navigation = useNavigation();
    const pathname = usePathname();

    // === State ===
    const [isLoading, setIsLoading] = useState(true);
    const [gameData, setGameData] = useState<CrosswordData | null>(null);
    const [foundWordIds, setFoundWordIds] = useState<number[]>([]);
    const [inputText, setInputText] = useState("");
    const [activeHint, setActiveHint] = useState<string>("Find the hidden words!");
    const [hintCount, setHintCount] = useState(10);
    const [hasTyped, setHasTyped] = useState(false); // ✨ 플레이스홀더 제어용

    // === Audio Refs ===
    const correctSound = useRef<Audio.Sound | null>(null);
    const wrongSound = useRef<Audio.Sound | null>(null);

    const gameLevelKey = LEVEL_MAP[level || '1'] || 'FIRST';

    useEffect(() => {
        resetGame();
        loadGameData();
        loadSounds(); // ✨ 사운드 로드

        return () => {
            setIsPlaying(false);
            unloadSounds(); // ✨ 사운드 해제
        };
    }, []);

    const loadSounds = async () => {
        try {
            const { sound: correct } = await Audio.Sound.createAsync(
                require('@/assets/audio/game/correct.mp3')
            );
            correctSound.current = correct;

            const { sound: wrong } = await Audio.Sound.createAsync(
                require('@/assets/audio/game/wrong.mp3')
            );
            wrongSound.current = wrong;
        } catch (error) {
            console.log("Sound loading failed", error);
        }
    };

    const unloadSounds = async () => {
        if (correctSound.current) await correctSound.current.unloadAsync();
        if (wrongSound.current) await wrongSound.current.unloadAsync();
    };

    const playSound = async (type: 'correct' | 'wrong') => {
        try {
            const sound = type === 'correct' ? correctSound.current : wrongSound.current;
            if (sound) await sound.replayAsync();
        } catch (e) {
            console.log(e);
        }
    };

    const loadGameData = async () => {
        try {
            setIsLoading(true);
            const response = await fetchGameContent<CrosswordData>(GAME_ID, gameLevelKey);
            if (response.items && response.items.length > 0) {
                setGameData(response.items[0]);
                setIsPlaying(true);
            }
        } catch (error) {
            crossPlatformAlert("Error", "Failed to load game data.");
            router.back();
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = () => {
        if (!inputText.trim()) return;
        setHasTyped(true); // 입력 시작하면 true로

        if (!gameData) return;
        const text = inputText.toUpperCase().trim();
        
        const isAlreadyFound = gameData.words.some(w => 
            w.word === text && foundWordIds.includes(w.wordId)
        );

        if (isAlreadyFound) {
            setInputText("");
            return;
        }

        const matchedWord = gameData.words.find(w => w.word === text);

        if (matchedWord) {
            // ✅ 정답
            playSound('correct'); // ✨ 효과음
            setFoundWordIds(prev => [...prev, matchedWord.wordId]);
            setInputText("");
            setActiveHint(`Found: ${matchedWord.word}`); 
            
            if (foundWordIds.length + 1 === gameData.words.length) {
                handleGameClear();
            }
        } else {
            // ❌ 오답
            playSound('wrong'); // ✨ 효과음
            setInputText(""); 
        }
    };

    const useHint = () => {
        if (!gameData || hintCount <= 0) return;
        const hiddenWords = gameData.words.filter(w => !foundWordIds.includes(w.wordId));
        if (hiddenWords.length > 0) {
            const randomWord = hiddenWords[Math.floor(Math.random() * hiddenWords.length)];
            setActiveHint(`HINT: ${randomWord.clue}`);
            setHintCount(prev => prev - 1);
        }
    };

    const handleGameClear = async () => {
        setIsPlaying(false);
        const levelScore = parseInt(level || "1");
        if (user?.userId) {
            await submitGameScore(GAME_ID, user.userId, levelScore);
        }
        crossPlatformAlert("🎉 Cleared!", "All words found!");
        if (navigation.canGoBack()) router.back();
        else {
            const lobbyPath = pathname.replace('/play', '');
            router.replace(lobbyPath as any);
        }
    };

    const getCellStatus = (r: number, c: number) => {
        if (!gameData) return false;
        return gameData.words.some(w => {
            if (!foundWordIds.includes(w.wordId)) return false;
            const len = w.word.length;
            if (w.direction === 'ACROSS') {
                return r === w.startRow && c >= w.startCol && c < w.startCol + len;
            } else {
                return c === w.startCol && r >= w.startRow && r < w.startRow + len;
            }
        });
    };

    // === 🎨 사이즈 계산 ===
    if (isLoading || !gameData) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#E74C3C" />
            </View>
        );
    }

    // 웹에서 최대 600, 최소 500 적용 (헤더 제외한 게임 영역 너비)
    // padding 30 고려
    const MAX_BOARD_WIDTH = 600; 
    
    // 화면 너비와 MAX 중 작은 것 선택, 단 웹이면 최소 500 보장
    let wrapperWidth: DimensionValue = '100%';
    let boardSize = windowWidth - 30;

    if (Platform.OS === 'web') {
        // 웹: 창이 아무리 작아도 500px은 유지, 크면 600px까지
        wrapperWidth = Math.max(500, Math.min(windowWidth, MAX_BOARD_WIDTH));
        boardSize = typeof wrapperWidth === 'number' ? wrapperWidth - 30 : 500;
    } else {
        // 앱: 그냥 화면 꽉 차게
        boardSize = Math.min(windowWidth, MAX_BOARD_WIDTH) - 30;
    }
    
    const cellSize = boardSize / gameData.gridSize;
    const fontSize = Math.floor(cellSize * 0.6);

    return (
        <View style={styles.container}>
            {/* 1. 헤더는 container 직계 자식 (width 100% 보장) */}
            <GameHeader />

            {/* 2. 게임 영역 래퍼 (웹에서 너비 제한) */}
            <View style={[styles.contentWrapper, Platform.OS === 'web' && { width: wrapperWidth }]}>
                
                <View style={styles.infoBar}>
                    <Text style={styles.infoText}>
                        Found: {foundWordIds.length} / {gameData.words.length}
                    </Text>
                </View>

                {/* 그리드 */}
                <View style={[styles.gridContainer, { width: boardSize, height: boardSize }]}>
                    {gameData.grid.map((row, r) => (
                        <View key={r} style={styles.row}>
                            {row.map((char, c) => {
                                const isHighlighted = getCellStatus(r, c);
                                return (
                                    <View
                                        key={c}
                                        style={[
                                            styles.cell,
                                            { width: cellSize, height: cellSize },
                                            isHighlighted && styles.cellFound
                                        ]}
                                    >
                                        <Text style={[
                                            styles.cellText, 
                                            { fontSize: fontSize },
                                            isHighlighted && styles.cellTextFound
                                        ]}>
                                            {char}
                                        </Text>
                                    </View>
                                );
                            })}
                        </View>
                    ))}
                </View>

                {/* 하단 컨트롤 */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.bottomArea}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
                >
                    <View style={styles.hintDisplay}>
                        <Text style={styles.hintText}>{activeHint}</Text>
                    </View>

                    <View style={styles.inputRow}>
                        <TouchableOpacity 
                            style={[styles.hintBtn, hintCount === 0 && styles.disabledBtn]} 
                            onPress={useHint}
                            disabled={hintCount === 0}
                        >
                            <Text style={styles.hintBtnText}>Hint ({hintCount})</Text>
                        </TouchableOpacity>

                        <TextInput
                            style={styles.input}
                            value={inputText}
                            onChangeText={setInputText}
                            onSubmitEditing={handleSubmit}
                            // ✨ 한번 타이핑하면 placeholder 사라짐
                            placeholder={hasTyped ? "" : "Type Word..."}
                            autoCorrect={false}
                            autoCapitalize="characters"
                            returnKeyType="search"
                            blurOnSubmit={false} 
                        />
                        
                        <TouchableOpacity style={styles.enterBtn} onPress={handleSubmit}>
                            <Text style={styles.enterBtnText}>⏎</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#F4F6F7',
        width: '100%', // 전체 너비 사용
    },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    contentWrapper: {
        flex: 1,
        // alignItems: 'center',  <-- 여기 있으면 내부 아이템 중앙 정렬
        justifyContent: 'space-between',
        paddingBottom: 20,
        alignSelf: 'center', // ✨ 래퍼 자체를 화면 중앙에 둠
        width: '100%',       // 기본 모바일
    },

    infoBar: { padding: 15, alignItems: 'center' },
    infoText: { fontSize: 18, fontWeight: 'bold', color: '#34495E' },

    gridContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center', // 래퍼 안에서 그리드 중앙 정렬
    },
    row: { flexDirection: 'row' },
    cell: {
        borderWidth: 0.5,
        borderColor: '#BDC3C7',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    cellFound: { backgroundColor: '#F1C40F', borderColor: '#F39C12' },
    cellText: { fontWeight: 'bold', color: '#7F8C8D' },
    cellTextFound: { color: '#fff' },

    bottomArea: {
        width: '100%',
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: '#fff',
        borderRadius: 15,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        marginBottom: Platform.OS === 'web' ? 20 : 0,
    },
    hintDisplay: {
        minHeight: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        paddingHorizontal: 10,
        backgroundColor: '#ECF0F1',
        borderRadius: 8,
    },
    hintText: { fontSize: 15, color: '#2C3E50', fontWeight: '600', textAlign: 'center' },
    inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    hintBtn: { backgroundColor: '#95A5A6', paddingVertical: 12, paddingHorizontal: 12, borderRadius: 8 },
    disabledBtn: { backgroundColor: '#D7DBDD' },
    hintBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
    input: {
        flex: 1, height: 50, borderWidth: 2, borderColor: '#3498DB', borderRadius: 8,
        paddingHorizontal: 10, fontSize: 16, fontWeight: 'bold', backgroundColor: '#fff', textAlign: 'center'
    },
    enterBtn: { backgroundColor: '#3498DB', width: 50, height: 50, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
    enterBtnText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
});
