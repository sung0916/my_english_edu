import { API_BASE_URL } from "@/api";
import { CardOption } from "@/api/gameApi";
import GameHeader from "@/components/game/common/GameHeader";
import { useGameSound } from "@/hooks/game/useGameSound";
import { useGameTimer } from "@/hooks/game/useGameTimer";
import { useMysteryCardGame } from "@/hooks/game/useMysteryCardGame";
import { useGameStore } from "@/store/gameStore";
import { useEffect } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
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
                    // 애니메이션 완료 콜백은 여기서 처리 가능하지만 state 관리는 부모에서 함
                });
                onFlippedback();  // 부모의 shouldFlipBack 상태 끄기
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [shouldFlipBack]);

    // 이미지 경로 처리 (http로 시작하면 그대로, 아니면 BaseURL 결합)
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
    const { width } = useWindowDimensions();
    const { isPaused } = useGameStore();

    // Hook을 통한 로직 분리 (데이터, 상태 관리)
    const {
        loading, currentQuestion, questionLength, currentIndex,
        score, lives, isProcessing, wrongCardId, limitSeconds,
        handleAnswer, handleTimeOver, resetWrongCard
    } = useMysteryCardGame();

    // 사운드 훅 사용
    const { playCorrect, playWrong } = useGameSound();

    // 타이머 훅 사용
    const { timeLeft, resetTimer } = useGameTimer({
        initialTime: limitSeconds,
        shouldRun: !loading && !isProcessing && !isPaused,
        onTimeOver: () => {
            playWrong();
            handleTimeOver();
        }
    });

    // 문제 바뀔 때 타이머 리셋
    useEffect(() => {
        resetTimer();
    }, [currentIndex]);

    // 반응형 레이아웃
    const IS_MOBILE = width < 700;
    const NUM_COLUMNS = IS_MOBILE ? 2 : 4;
    const GAP = 12;
    const PADDING = 20;

    // 전체 너비에서 패딩과 갭을 뺀 나머지 공간 n등분
    const cardWidth = (width - (PADDING * 2) - (GAP * (NUM_COLUMNS - 1))) / NUM_COLUMNS;

    // Web에서 카드가 너무 커지는 것 방지
    const finalCardWidth = Math.min(cardWidth, 200);

    // 로딩 화면
    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <GameHeader />
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#3B82F6" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* 1. Header (Includes Back, Mute, Fullscreen, Records) */}
            <GameHeader />

            <View style={styles.gameContainer}>
                {/* 2. Game Info (Score & Progress) */}
                <View style={styles.infoBar}>
                    <View style={styles.livesContainer}>
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Text key={i} style={styles.heartIcon}>
                                {i < lives ? '❤️' : '💔'}
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

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.progressContainer}>
                        <Text style={styles.progressText}>
                            Question {currentIndex + 1} / {questionLength}
                        </Text>
                    </View>

                    <View style={styles.sentenceBox}>
                        <Text style={styles.sentenceText}>
                            {currentQuestion?.sentence}
                        </Text>

                        <Text style={styles.hintText}>
                            Find the matching card!
                        </Text>
                    </View>

                    <View style={[styles.cardsGrid, { gap: GAP }]}>
                        {currentQuestion?.options.map((opt) => (
                            <GameCard
                                key={`${currentIndex} - ${opt.wordId}`}
                                option={opt}
                                cardWidth={finalCardWidth}
                                disabled={isProcessing || isPaused}
                                shouldFlipBack={wrongCardId === opt.wordId}
                                onFlippedback={resetWrongCard}
                                onPress={() => {
                                    // 정답 체크 로직 (Sound 훅 활용)
                                    if (isPaused) return;
                                    const isCorrect = handleAnswer(opt);
                                    if (isCorrect) playCorrect();
                                    else playWrong();
                                }}
                            />
                        ))}
                    </View>
                </ScrollView>

                {/* 일시정지 오버레이 */}
                {isPaused && (
                    <View style={[styles.pauseOverlay]}>
                        <Text style={styles.pauseText}>PAUSED</Text>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F3F4F6' },
    gameContainer: {
        flex: 1,
        position: 'relative', // 오버레이 위치 기준점
    },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    infoBar: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#fff',
        borderBottomWidth: 1, borderColor: '#E5E7EB'
    },
    livesContainer: { flexDirection: 'row', gap: 4 },
    heartIcon: { fontSize: 20 },
    scoreText: { fontSize: 18, fontWeight: 'bold', color: '#2563EB' },

    timerBadge: { backgroundColor: '#E0F2FE', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    timerWarning: { backgroundColor: '#FEE2E2' },
    timerText: { fontWeight: 'bold', color: '#0284C7' },
    timerTextWarning: { color: '#DC2626' },

    scrollContent: { flexGrow: 1, paddingBottom: 40 },
    progressContainer: { alignItems: 'center', marginTop: 15 },
    progressText: { fontSize: 14, color: '#6B7280' },

    sentenceBox: {
        backgroundColor: 'white', padding: 30, borderRadius: 20, margin: 20,
        alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, elevation: 5,
    },
    sentenceText: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', textAlign: 'center', marginBottom: 10 },
    hintText: { fontSize: 14, color: '#9CA3AF' },

    cardsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },

    // Card Internal Styles
    cardFace: {
        position: 'absolute', width: '100%', height: '100%', borderRadius: 12,
        justifyContent: 'center', alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 3.84, elevation: 5,
    },
    cardFront: { backgroundColor: '#3B82F6', borderWidth: 2, borderColor: '#2563EB', padding: 4 },
    cardBack: { backgroundColor: 'white', borderWidth: 1, borderColor: '#E5E7EB' },
    cardText: { color: 'white', fontWeight: 'bold', fontSize: 13, textAlign: 'center' },
    cardImage: { width: '100%', height: '100%', borderRadius: 10 },

    pauseOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.6)', 
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20,
    },
    pauseText: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#555', // Falling Words와 색상 통일
    },
});
