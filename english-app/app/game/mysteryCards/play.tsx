import { API_BASE_URL } from "@/api";
import { CardOption, fetchGameContent, MysteryCardData, submitGameScore } from "@/api/gameApi";
import GameHeader from "@/components/game/common/GameHeader";
import { useUserStore } from "@/store/userStore";
import { crossPlatformAlert } from "@/utils/crossPlatformAlert";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from "react-native-safe-area-context";

// sub Component: 카드 뒤집기 (Reanimated Login)
interface GameCardProps {
    option: CardOption;
    onPress: () => void;
    disabled: boolean;
    cardWidth: number;
}

// 카드의 개별 컴포넌트 (애니메이션 로직 포함)
const GameCard = ({ option, onPress, disabled, cardWidth }: GameCardProps) => {
    const flipAnim = useSharedValue(0);  // 애니메이션 값 (0: 앞면, 1: 뒷면)

    // 이미지 경로 처리 (http로 시작하면 그대로, 아니면 BaseURL 결합)
    const fullImageUrl = option.imageUrl.startsWith('http')
        ? option.imageUrl
        : `${API_BASE_URL}${option.imageUrl}`;

    // 앞면 스타일 (0~90도일 때 보임)d
    const frontStyle = useAnimatedStyle(() => {
        const rotateValue = interpolate(flipAnim.value, [0, 1], [0, 180]);
        return {
            transform: [{ rotateY: `${rotateValue}deg` }],
            opacity: rotateValue <= 90 ? 1 : 0,  // 90도 넘어가면 숨김
        };
    });

    // 뒷면 스타일 (90~180도일 때 보임)
    const backStyle = useAnimatedStyle(() => {
        const rotateValue = interpolate(flipAnim.value, [0, 1], [180, 360]);
        return {
            transform: [{ rotateY: `${rotateValue}deg` }],
            opacity: rotateValue >= 270 ? 0 : 1,  // 로직 상 180도에서 시작하므로 보임
        };
    });

    // 클릭 핸들러
    const handlePress = () => {
        if (disabled) return;
        flipAnim.value = withTiming(1, { duration: 500 });  // 뒤집기 애니메이션 시작
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
                    resizeMode="contain"
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

    const GAP = 10;
    const PADDING = 20;
    const cardWidth = (width - (PADDING * 2) - (GAP * 3)) / 4;

    // 1. Fetch Data(데이터 가져오기)
    useEffect(() => {
        const loadData = async () => {
            try {
                // GameId와 Level로 데이터 요청
                const response = await fetchGameContent<MysteryCardData>(Number(gameId), String(level));

                if (response.items && response.items.length > 0) {
                    setQuestions(response.items);

                } else {
                    crossPlatformAlert('', '존재하지 않는 게임입니다.');
                    router.back();
                }

            } catch (error) {
                console.error(error);
                crossPlatformAlert('', '게임을 불러오는데 실패했습니다.');
                router.back();

            } finally {
                setLoading(false);
            }
        };
        if (gameId && level) loadData();
    }, [gameId, level]);

    // Answer Logic
    const handleAnswer = (option: CardOption) => {
        if (isProcessing) return;
        setIsProcessing(true);

        if (option.isAnswer) {  // 맞았을 때
            setScore(prev => prev + 10);

            // 1.5초 뒤 다음 문제로
            setTimeout(() => {
                nextQuestion();
            }, 1500);

        } else {  // 틀렸을 때
            crossPlatformAlert('', 'Try Again.');

            setTimeout(() => {
                nextQuestion();
            }, 1000);
        }
    };

    const nextQuestion = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setIsProcessing(false);

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
                <Text style={styles.scoreText}>Score: {score}</Text>
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
                            key={opt.wordId}
                            option={opt}
                            onPress={() => handleAnswer(opt)}
                            disabled={isProcessing}
                            cardWidth={cardWidth}
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
        backgroundColor: '#F3F4F6', // Light Gray Background
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    scoreText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2563EB', // Blue-600
    },
    progressText: {
        fontSize: 16,
        color: '#6B7280', // Gray-500
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center', // 세로 중앙 정렬
        paddingHorizontal: 20,
        paddingBottom: 40,
        gap: 60, // 문장과 카드 사이 간격 넉넉하게
    },
    sentenceBox: {
        backgroundColor: 'white',
        padding: 30,
        borderRadius: 20,
        alignItems: 'center',
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    sentenceText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1F2937',
        textAlign: 'center',
        marginBottom: 10,
        lineHeight: 32,
    },
    hintText: {
        fontSize: 14,
        color: '#9CA3AF',
    },
    // Cards Layout
    cardsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    // Card Styles
    cardFace: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backfaceVisibility: 'hidden',
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3.84,
        elevation: 5,
    },
    cardFront: {
        backgroundColor: '#3B82F6', // Blue card back
        borderWidth: 2,
        borderColor: '#2563EB',
        padding: 4,
    },
    cardBack: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    cardText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 13,
        textAlign: 'center',
    },
    cardImage: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
    },
});
