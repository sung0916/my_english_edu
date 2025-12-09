import { fetchGameContent, submitGameScore, WordDto } from "@/api/gameApi";
import GameHeader from "@/components/game/common/GameHeader";
import WordBubble from "@/components/game/fallingWords/WordBubble";
import { useGameStore } from "@/store/gameStore";
import { useUserStore } from "@/store/userStore";
import { crossPlatformAlert } from "@/utils/crossPlatformAlert";
import { Audio } from 'expo-av'; // 효과음
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Speech from 'expo-speech'; // TTS
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";

const GAME_ID = 1;  // DB 상 FallingWords의 ID

// 단어 속도 정의 (ms단위)
const LEVEL_CONFIG: Record<string, { dropSpeed: number; spawnInterval: number }> = {
    'FIRST': { dropSpeed: 18000, spawnInterval: 2500 },
    'SECOND': { dropSpeed: 15000, spawnInterval: 2000 },
    'THIRD': { dropSpeed: 12000, spawnInterval: 1800 },
    'FOURTH': { dropSpeed: 10000, spawnInterval: 1500 },
    'FIFTH': { dropSpeed: 8000, spawnInterval: 1000 },
};

const LEVEL_MAP: Record<string, string> = {
    '1': 'FIRST',
    '2': 'SECOND',
    '3': 'THIRD',
    '4': 'FOURTH',
    '5': 'FIFTH',
};

interface FallingWord extends WordDto {
    uid: number;  // 렌더링용 id
    x: number;
    y: number;
    speed: number;
    isMatched: boolean;
}

export default function FallingWordsGame() {
    const { height, width } = useWindowDimensions();
    const { level } = useLocalSearchParams<{ level: string }>();
    const router = useRouter();

    // Stores
    const { setScore, resetGame, isPaused, isPlaying, setIsPlaying } = useGameStore();
    const { user } = useUserStore();  // 현재 로그인한 계정 정보

    // Local States
    const [activeWords, setActiveWords] = useState<FallingWord[]>([]);
    const [inputText, setInputText] = useState('');
    const [lives, setLives] = useState(5);
    const [currentScore, setCurrentScore] = useState(0.0);
    const [isLoading, setIsLoading] = useState(true);

    // Refs for Loop (Closure 문제 해결용)
    const gameLevelKey = LEVEL_MAP[level || '1'] || 'FIRST';  // 파라미터가 없으면 FIRST
    const config = LEVEL_CONFIG[gameLevelKey];

    const wordsQueue = useRef<WordDto[]>([]);
    const activeWordsRef = useRef<FallingWord[]>([]);
    const frameRef = useRef<number>(0);
    const lastSpawnTime = useRef<number>(0);
    const totalWordsCount = useRef<number>(1);  // 0으로 나누기 방지용으로 1로 초기화
    const soundObject = useRef<Audio.Sound | null>(null);

    const scoreRef = useRef(0.0);  // 점수 동기화

    // 1. 게임 데이터 로드 or 초기화
    useEffect(() => {
        resetGame();
        setLives(5);
        setCurrentScore(0.0);
        scoreRef.current = 0.0;
        setScore(0);

        // 오답 사운드 로드
        loadSound();

        // 서버에서 데이터 가져오기
        loadGameData();

        return () => {
            setIsPlaying(false);
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
            if (soundObject.current) soundObject.current.unloadAsync();
        };
    }, []);

    const loadSound = async () => {
        try {
            // 1. 오디오 파일 로드 (require 경로 체크 필요)
            const { sound } = await Audio.Sound.createAsync(
                require('@/assets/audio/game/waterdrop.mp3')
            );

            // 2. Ref에 저장 (checkInput 등에서 replayAsync로 사용하기 위함)
            soundObject.current = sound;

            // 3. (옵션) 로드 확인을 위해 즉시 한번 재생
            // await sound.playAsync();

        } catch (e) {
            console.log(e);
        }
    };

    const loadGameData = async () => {
        try {
            setIsLoading(true);
            const data = await fetchGameContent<WordDto>(1, gameLevelKey);  // 개발 때 game_id = 1 고정

            if (data.items && data.items.length > 0) {
                wordsQueue.current = [...data.items];  // 큐에 담기
                totalWordsCount.current = data.items.length;  // 총 갯수 저장
                setIsPlaying(true);  // 로딩 끝나면 시작

            } else {
                crossPlatformAlert('', '게임 데이터 로딩 실패');
                router.back();
            }

        } catch (error) {
            console.error(error);
            crossPlatformAlert('', '서버 연결 실패');
            router.back();

        } finally {
            setIsLoading(false);
        }
    };

    // 2. 게임 루프
    useEffect(() => {
        if (!isPlaying || isPaused || isLoading) {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
            return;
        }

        const gameLoop = (timestamp: number) => {
            // A. 단어 생성 (Spawn)
            if (timestamp - lastSpawnTime.current > config.spawnInterval) {
                if (wordsQueue.current.length > 0) {  // 대기열에 단어가 있을 때
                    spawnNewWord();
                    lastSpawnTime.current = timestamp;

                } else if (activeWordsRef.current.length === 0) {  // 대기열에 단어가 없을 때
                    gameOver(true);
                    return;  // 루프 종료
                }
            }

            // B. 단어 이동 (Move)
            updateWords();
            frameRef.current = requestAnimationFrame(gameLoop);
        }

        frameRef.current = requestAnimationFrame(gameLoop);
        return () => {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, [isPlaying, isPaused, isLoading]);

    // 헬퍼 함수
    const spawnNewWord = () => {
        const wordData = wordsQueue.current.pop();  // 큐에서 하나씩 꺼냄
        if (!wordData) return;

        // x좌표 랜덤 (화면 밖으로 안나가게 여백 적용)
        const randomX = Math.random() * (width - 150) + 25;
        // 속도 계산 (화면 높이를 dropSpeed(ms)동안 통과)
        const pxPerFrame = height / (config.dropSpeed / 16.6);

        const newWord: FallingWord = {
            ...wordData,
            uid: Date.now() + Math.random(),
            x: randomX,
            y: -60,  // 화면 위
            speed: pxPerFrame,
            isMatched: false,
        }

        activeWordsRef.current.push(newWord);
    };

    const updateWords = () => {
        const nextWords: FallingWord[] = [];
        let missed = false;

        activeWordsRef.current.forEach(word => {
            if (!word.isMatched) {  // 정답 맞춘 단어는 이동 멈춤 (시각 효과용)
                word.y += word.speed;
            }

            if (word.y > height + 50) {  // 화면 아래로 떨어짐 (miss)
                if (!word.isMatched) missed = true;

            } else {
                nextWords.push(word);
            }
        });

        if (missed) {
            setLives(prev => {
                const newLives = prev - 1;
                if (newLives <= 0) gameOver(false);
                return newLives;
            });
        }

        activeWordsRef.current = nextWords;
        setActiveWords([...activeWordsRef.current]);  // State 업데이트 -> 렌더링
    }

    // 3. 입력 판정 로직
    const checkInput = async () => {
        const text = inputText.trim();
        if (!text) return;

        // 화면에 떠있는 단어 중 일치하는 것 찾기(대소문자 무시)
        const matchIndex = activeWordsRef.current.findIndex(
            w => !w.isMatched && w.content.toLowerCase() === text.toLowerCase()
        );

        if (matchIndex !== -1) {  // 정답
            const matchedWord = activeWordsRef.current[matchIndex];
            matchedWord.isMatched = true;  // 해당 단어 ui 변경

            // a. 점수 계산 (100점 만점 / 총 단어 수)
            const pointsPerWord = 100 / totalWordsCount.current;
            const nextScore = parseFloat((currentScore + pointsPerWord).toFixed(1));

            // 점수 업데이트
            setCurrentScore(nextScore);
            scoreRef.current = nextScore;
            setScore(nextScore);  // Zustand 업데이트

            // b. TTS 재생
            Speech.speak(matchedWord.content, { language: 'en' });

            // c. 입력창 초기화
            setInputText('');

            // d. 0.5초 뒤 화면에서 제거
            setTimeout(() => {
                activeWordsRef.current = activeWordsRef.current.filter(
                    w => w.uid !== matchedWord.uid
                );
                setActiveWords([...activeWordsRef.current]);
            }, 500);

        } else {  // 오답
            setInputText('');  // 오답 시 입력창 초기화

            if (soundObject.current) {
                try {
                    await soundObject.current.replayAsync();  // 소리를 처음부터 재생(겹쳐서 재생 가능)
                } catch (e) {
                    console.error(e);
                }
            } else {  // 사운드 파일 없을 시 임시 피드백 (진동 등)
                console.log("Wrong Answer!");
            }
        }
    };

    const gameOver = async (isClear: boolean) => {
        setIsPlaying(false);
        const finalScore = scoreRef.current;
        const title = isClear ? "🏆 Stage Clear! 🏆" : "💔 Game Over 💔";

        if (user && user.userId) {  // 서버로 점수 전송 (로그인 된 경우)
            try {
                await submitGameScore(1, user.userId, finalScore);
            } catch (error) {
                console.error(error);
            }
        }

        crossPlatformAlert('', `최종 점수 : ${finalScore}`);
        router.back();  // 게임 메인 화면으로 이동
    };

    // Render
    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3498DB" />
                <Text style={{ marginTop: 10 }}>Loading words...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <GameHeader />

            {/* 게임 영역 */}
            <View style={styles.gameArea}>
                {/* 단어들 */}
                {activeWords.map(word => (
                    <WordBubble
                        key={word.uid}
                        text={word.content}
                        meaning={word.meaning}
                        x={word.x}
                        y={word.y}
                        isMatched={word.isMatched}
                    />
                ))}

                {/* 일시정지 시 화면 가리는 오버레이 */}
                {isPaused && (
                    <View style={[styles.gameArea, styles.pauseOverlay]}>
                        <Text style={{ fontSize: 30, fontWeight: 'bold', color: '#555' }}>
                            PAUSED
                        </Text>
                    </View>
                )}
            </View>

            {/* 정보 표시 (점수, 레벨, 기회) */}
            <View style={styles.hud}>
                <Text style={styles.hudLevel}>{gameLevelKey}</Text>
                <Text style={styles.hudScore}>{currentScore.toFixed(1)}</Text>
                <View style={styles.livesRow}>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Text key={i} style={styles.heart}>{i < lives ? '❤️' : '💔'}</Text>
                    ))}
                </View>
            </View>

            {/* 입력창 */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.inputContainer}
            >
                <TextInput
                    style={styles.input}
                    placeholder="Type here..."
                    value={inputText}
                    onChangeText={setInputText}
                    onSubmitEditing={checkInput}
                    autoFocus={Platform.OS === 'web'}
                    autoCorrect={false}
                    autoCapitalize="none"
                    editable={!isPaused}
                    blurOnSubmit={false}  // 엔터쳐도 키보드 유지
                />
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#E8F6F3' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    gameArea: { flex: 1, position: 'relative', overflow: 'hidden' },

    hud: {
        position: 'absolute',
        top: 70, right: 20,
        backgroundColor: 'rgba(255,255,255,0.85)',
        padding: 12, borderRadius: 12,
        alignItems: 'flex-end',
        borderWidth: 1, borderColor: '#ddd',
        elevation: 3,
    },
    hudLevel: { fontSize: 12, color: '#7f8c8d', fontWeight: 'bold', marginBottom: 2 },
    hudScore: { fontSize: 28, fontWeight: 'bold', color: '#2C3E50' },
    livesRow: { flexDirection: 'row', marginTop: 4 },
    heart: { fontSize: 14, marginHorizontal: 1 },

    inputContainer: {
        padding: 12, backgroundColor: '#fff',
        borderTopWidth: 1, borderTopColor: '#eee',
    },
    input: {
        height: 50,
        borderColor: '#3498DB', borderWidth: 2, borderRadius: 10,
        paddingHorizontal: 16, fontSize: 18,
        backgroundColor: '#fff',
    },

    pauseOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(255,255,255,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20,
    },
    disabledInput: {
        backgroundColor: '#f0f0f0',
        color: '#999'
    },
});
