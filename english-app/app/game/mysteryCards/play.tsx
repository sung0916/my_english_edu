import { API_BASE_URL } from "@/api";
import { CardOption, fetchGameContent, MysteryCardData, submitGameScore } from "@/api/gameApi";
import GameHeader from "@/components/game/common/GameHeader";
import { useUserStore } from "@/store/userStore";
import { crossPlatformAlert } from "@/utils/crossPlatformAlert";
import { Audio } from "expo-av";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from "react-native-safe-area-context";

// Card Component
interface GameCardProps {
    option: CardOption;
    onPress: () => void;
    disabled: boolean;
    cardWidth: number;
    shouldFlipBack: boolean;  // 다시 덮기
    onFlippedback: () => void;  // 덮기 완료 후 콜백
}

// 카드의 개별 컴포넌트 (애니메이션 로직 포함)
const GameCard = ({ option, onPress, disabled, cardWidth, shouldFlipBack, onFlippedback }:
    GameCardProps) => {
    const flipAnim = useSharedValue(0);  // 애니메이션 값 (0: 앞면, 1: 뒷면)

    // 오답일 때 카드 다시 뒤집기(Reset)
    useEffect(() => {
        if (shouldFlipBack) {
            // 0.5초 딜레이 후 다시 덮기 (이미지를 살짝만 볼 수 있게)
            const timer = setTimeout(() => {
                flipAnim.value = withTiming(0, { duration: 300 }, () => {
                    // 애니메이션 끝난 후 부모에게 알림 (상태 초기화용)
                    // JS 스레드에서 실행하기 위해 runOnJS가 필요할 수 있으나, 여기선 콜백 대신 상태로 관리하므로 생략
                });
                onFlippedback();  // 부모의 shouldFlipBack 상태 끄기
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [shouldFlipBack]);

    // 이미지 경로 처리 (http로 시작하면 그대로, 아니면 BaseURL 결합)
    // const safeImageUrl = option.imageUrl || "";
    // const fullImageUrl = option.imageUrl.startsWith('http')
    //     ? option.imageUrl
    //     : `${API_BASE_URL}${option.imageUrl}`;
    const safeImageUrl = option.imageUrl || "";
    let fullImageUrl = "https://placehold.co/400x400/e2e8f0/808080?text=No+Image";
    if (safeImageUrl) {
        fullImageUrl = safeImageUrl.startsWith('http')
            ? safeImageUrl
            : `${API_BASE_URL}${safeImageUrl}`;
    }

    // 앞면 스타일 (0~90도일 때 보임)d
    const frontStyle = useAnimatedStyle(() => {
        const rotateValue = interpolate(flipAnim.value, [0, 1], [0, 180]);
        return {
            transform: [{ rotateY: `${rotateValue}deg` }],
            opacity: rotateValue <= 90 ? 1 : 0,  // 90도 넘어가면 숨김
            backfaceVisibility: 'hidden',  // 뒷면 숨김
        };
    });

    // 뒷면 스타일 (90~180도일 때 보임)
    const backStyle = useAnimatedStyle(() => {
        const rotateValue = interpolate(flipAnim.value, [0, 1], [180, 360]);
        return {
            transform: [{ rotateY: `${rotateValue}deg` }],
            opacity: rotateValue >= 270 ? 0 : 1,  // 로직 상 180도에서 시작하므로 보임
            backfaceVisibility: 'hidden',
        };
    });

    // 클릭 핸들러
    const handlePress = () => {
        if (disabled || flipAnim.value > 0.5) return;  // 이미 뒤집혔거나 비활성이면 무시
        flipAnim.value = withTiming(1, { duration: 400 });  // 뒤집기 애니메이션 시작
        onPress();
    };

    return (
        <Pressable onPress={handlePress} style={{ width: cardWidth, height: cardWidth * 1.4 }}>
            {/* 앞면 (텍스트) */}
            <Animated.View style={[styles.cardFace, styles.cardFront, frontStyle]}>
                <Text style={styles.cardText} adjustsFontSizeToFit numberOfLines={2}>
                    {option.word}
                </Text>
            </Animated.View>

            {/* 뒷면 (이미지) */}
            <Animated.View style={[styles.cardFace, styles.cardBack, backStyle]}>
                <Image
                    source={{ uri: option.imageUrl }}
                    style={styles.cardImage}
                    resizeMode="cover"
                />
            </Animated.View>
        </Pressable>
    );
};

// 메인 게임 스크린
export default function MysteryCardsPlay() {
    const router = useRouter();
    const { gameId, level } = useLocalSearchParams();
    const { user } = useUserStore();
    const { width } = useWindowDimensions();

    const [questions, setQuestions] = useState<MysteryCardData[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);  // 중복 클릭 방지
    const [wrongCardId, setWrongCardId] = useState<number | null>(null);  // 오답 처리를 위한 상태

    // 제한 시간 및 생명 관리
    const [limitSeconds, setLimitSeconds] = useState(10);  // API에서 받아온 시간 제한
    const [timeLeft, setTimeLeft] = useState(10);  // 남은 시간
    const [questionLives, setQuestionLives] = useState(3);  // 생명

    const correctSound = useRef<Audio.Sound | null>(null);  // 사운드 객체 Refs
    const wrongSound = useRef<Audio.Sound | null>(null);  // 사운드 객체 Refs

    const GAP = 10;
    const PADDING = 20;
    const cardWidth = (width - (PADDING * 2) - (GAP * 3)) / 4;

    // 사운드 로드
    useEffect(() => {
        const loadSounds = async () => {
            try {
                const { sound: s1 } = await Audio.Sound.createAsync(require('@/assets/audio/game/correct.mp3'));
                const { sound: s2 } = await Audio.Sound.createAsync(require('@/assets/audio/game/wrong.mp3'));

                correctSound.current = s1;
                wrongSound.current = s2;

            } catch (error) {
                console.log("효과음 에러: ", error);
            }
        };

        loadSounds();

        // 인마운트 시 사운드 해제
        return () => {
            correctSound.current?.unloadAsync();
            wrongSound.current?.unloadAsync();
        };
    }, []);

    // 1. Fetch Data(데이터 가져오기)
    useEffect(() => {
        const loadData = async () => {
            try {
                // GameId와 Level로 데이터 요청
                const response = await fetchGameContent<MysteryCardData>(Number(gameId), String(level));

                if (response.items?.length > 0) {

                    // 🚨 받아온 문제 리스트를 통째로 찍어보기 (중복된 문제 발생)
                    // console.log("=== 받아온 문제 리스트 확인 ===");
                    // response.items.forEach((item, index) => {
                    //     console.log(`문제 ${index + 1}:`, item.sentence, `(정답: ${item.answerWord})`);
                    // });

                    setQuestions(response.items);

                    // API에서 받은 시간 제한 설정 (없으면 기본 10초)
                    const apiTimeLimit = response.timeLimit || 10;
                    setLimitSeconds(apiTimeLimit);
                    setTimeLeft(apiTimeLimit);

                } else {
                    crossPlatformAlert('', 'This game data does not exist');
                    router.back();
                }

            } catch (error) {
                console.error(error);
                crossPlatformAlert('', 'Failed loading game data');
                router.back();

            } finally {
                setLoading(false);
            }
        };
        if (gameId && level) loadData();
    }, [gameId, level]);

    // 타이머 로직
    useEffect(() => {
        // 로딩 중이거나, 처리 중(정답 맞춤 직후)이면 타이머 정리
        if (loading || isProcessing) return;

        const timerId = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerId);
                    handleTimerOver();  // 시간 초과 처리
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timerId);
    }, [loading, isProcessing, currentIndex, questionLives]);

    // 시간 초과 처리
    const handleTimerOver = async () => {
        if (isProcessing) return;
        setIsProcessing(true);  // 입력 잠금

        // 오답 사운드 재생
        try { await wrongSound.current?.replayAsync(); } catch { }

        // 실패 표시 후 다음 문제로 (점수 획득 없음)
        // crossPlatfromAlert('', 'Time Over');  // 알림창은 UX상 생략하거나 Toast로 대체

        setTimeout(() => {
            nextQuestion();
        }, 1000);
    }

    // 생명 소진 처리
    const handleLivesOver = async () => {
        setIsProcessing(true);

        // 오답 사운드 재생
        try { await wrongSound.current?.replayAsync(); } catch { }

        // 3번 틀림 -> 다음 문제로 (점수 획득 없음)
        setTimeout(() => {
            nextQuestion();
        }, 1000);
    };

    // 카드 클릭 처리
    const handleAnswer = async (option: CardOption) => {
        if (isProcessing) return;  // 이미 처리 중이면 무시

        if (option.isAnswer) {  // 맞았을 때
            setIsProcessing(true);  // 타이머 멈춤 및 클릭 방지
            try { await correctSound.current?.replayAsync(); } catch { }

            setScore(prev => prev + 10);
            setTimeout(() => {
                nextQuestion();
            }, 1000);

        } else {  // 틀렸을 때
            try { await wrongSound.current?.replayAsync(); } catch { }
            const nextLives = questionLives - 1;
            setQuestionLives(nextLives);
            setWrongCardId(option.wordId);  // 틀린 카드 다시 뒤집는 애니메이션 트리거

            if (nextLives <= 0) {  // 생명 모두 소진
                handleLivesOver();
            } else {
                // 아직 기회 있음 -> 카드만 다시 뒤집힘 (타이머는 계속 돔)
            }
        }
    };

    const nextQuestion = () => {
        console.log(`현재 인덱스: ${currentIndex}, Total: ${questions.length}`);
        setWrongCardId(null);  // 상태 초기화 먼저 실행

        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);

            // 다음 문제 초기화 (시간, 생명 리셋)
            setTimeLeft(limitSeconds);
            setQuestionLives(3);

            // 순서 꼬여서 멈춤 방지를 위해 딜레이주기
            setTimeout(() => {
                setIsProcessing(false);
            }, 300);

        } else {
            handleGameOver();
        }
    };

    const handleGameOver = async () => {
        try {
            if (user && user.userId) {
                await submitGameScore(Number(gameId), user.userId, score);
            }
            crossPlatformAlert('Game Over', `Final Score: ${score}`);
            router.back();

        } catch (e) {
            console.error(e);
            router.back();
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <GameHeader />
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#3B82F6" />
                    <Text style={{ marginTop: 10 }}>Loading Game...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const currentQuestion = questions[currentIndex];

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* 1. Header (Includes Back, Mute, Fullscreen, Records) */}
            <GameHeader />

            {/* 2. Game Info (Score & Progress) */}
            <View style={styles.infoBar}>
                <View style={styles.livesContainer}>
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Text key={i} style={styles.heartIcon}>
                            {i < questionLives ? '❤️' : '💔'}
                        </Text>
                    ))}
                </View>

                <Text style={styles.scoreText}>{score} Pts</Text>

                <View style={[styles.timerBadge, timeLeft <= 3 && styles.timerWarning]}>
                    <Text style={[styles.timerText, timeLeft <= 3 && styles.timerTextWarning]}>
                        ⏱️ {timeLeft}s
                    </Text>
                </View>
            </View>

            <View style={styles.progressContainer}>
                <Text style={styles.progressText}>
                    Question {currentIndex + 1} / {questions.length}
                </Text>
            </View>

            {/* 3. Main Content */}
            <View style={styles.contentContainer}>

                {/* Sentence Box */}
                <View style={styles.sentenceBox}>
                    <Text style={styles.sentenceText}>
                        {currentQuestion?.sentence}
                    </Text>
                    <Text style={styles.hintText}>Find the matching card!</Text>
                </View>

                {/* Cards Row (4x1) */}
                <View style={styles.cardsRow}>
                    {currentQuestion?.options.map((opt) => (
                        <GameCard
                            key={`${currentIndex}-${opt.wordId}`}
                            option={opt}
                            onPress={() => handleAnswer(opt)}
                            disabled={isProcessing}
                            cardWidth={cardWidth}
                            shouldFlipBack={wrongCardId === opt.wordId}  // 틀린 카크만 다시 뒤집기 위한 Props 전달
                            onFlippedback={() => setWrongCardId(null)}
                        />
                    ))}
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { 
        flex: 1, 
        backgroundColor: '#F3F4F6' 
    },
    center: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },

    // Header Info Styles
    infoBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderColor: '#E5E7EB'
    },
    livesContainer: { flexDirection: 'row', gap: 4 },
    heartIcon: { fontSize: 20 },
    scoreText: { fontSize: 18, fontWeight: 'bold', color: '#2563EB' },

    timerBadge: {
        backgroundColor: '#E0F2FE',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20
    },
    timerWarning: { backgroundColor: '#FEE2E2' }, // 시간이 얼마 안 남았을 때 빨간색 배경
    timerText: { fontWeight: 'bold', color: '#0284C7' },
    timerTextWarning: { color: '#DC2626' },

    progressContainer: { alignItems: 'center', marginTop: 10 },
    progressText: { fontSize: 14, color: '#6B7280' },

    contentContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        paddingHorizontal: 20, 
        paddingBottom: 40, 
        gap: 40 
    },
    sentenceBox: {
        backgroundColor: 'white', 
        padding: 30, 
        borderRadius: 20, 
        alignItems: 'center',
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 4 }, 
        shadowOpacity: 0.1, 
        shadowRadius: 10, 
        elevation: 5,
    },
    sentenceText: { 
        fontSize: 20, 
        fontWeight: 'bold', 
        color: '#1F2937', 
        textAlign: 'center', 
        marginBottom: 10, 
        lineHeight: 30 
    },
    hintText: { fontSize: 14, color: '#9CA3AF' },

    cardsRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
    },

    // Card Styles (동일)
    cardFace: {
        position: 'absolute', 
        width: '100%', 
        height: '100%', 
        borderRadius: 12, 
        justifyContent: 'center', 
        alignItems: 'center',
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.15, 
        shadowRadius: 3.84, 
        elevation: 5,
    },
    cardFront: { backgroundColor: '#3B82F6', borderWidth: 2, borderColor: '#2563EB', padding: 4 },
    cardBack: { backgroundColor: 'white', borderWidth: 1, borderColor: '#E5E7EB' },
    cardText: { color: 'white', fontWeight: 'bold', fontSize: 13, textAlign: 'center' },
    cardImage: { width: '100%', height: '100%', borderRadius: 10 },
});
