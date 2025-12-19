import apiClient from "@/api";
import { crossPlatformAlert } from "@/utils/crossPlatformAlert";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Animated, FlatList, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";

interface Place {
    id: number;
    placeName: string;
    description?: string;
}

// 🎨 1. 애니메이션을 담당할 카드 컴포넌트 분리
const PlaceCard = ({ item, index, width, numColumns, onPress }: any) => {
    // 애니메이션 값 (크기: 1 -> 1.05)
    const scaleAnim = useRef(new Animated.Value(1)).current;
    // 호버 상태 관리 (웹 전용)
    const [isHovered, setIsHovered] = useState(false);

    // 카드 스타일 계산
    const gap = 16;
    const containerPadding = 32;
    const availableWidth = width - containerPadding;
    const itemSize = (availableWidth / numColumns) - gap;

    // 색상 패턴
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'];
    const accentColor = colors[index % colors.length];

    // 애니메이션 실행 함수
    const handleAnimate = (toValue: number) => {
        Animated.spring(scaleAnim, {
            toValue,
            friction: 5, // 탄성 (낮을수록 출렁거림)
            tension: 40, // 속도
            useNativeDriver: true,
        }).start();
    };

    const handleIn = () => {
        setIsHovered(true);
        handleAnimate(1.05); // 1.05배 확대
    };

    const handleOut = () => {
        setIsHovered(false);
        handleAnimate(1.0); // 원래 크기 복귀
    };

    // 텍스트 포맷팅
    const formatName = (name: string) => {
        if (!name) return "";
        return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase().replace(/_/g, " ");
    };

    return (
        <Pressable
            onPress={() => onPress(item.id, item.placeName)}
            // 🖱️ 웹: 마우스 호버 이벤트
            onHoverIn={handleIn}
            onHoverOut={handleOut}
            // 📱 앱: 터치 이벤트 (앱에서도 누를 때 커지는 효과)
            onPressIn={handleIn}
            onPressOut={handleOut}
            style={{ 
                marginHorizontal: gap / 2, 
                marginBottom: gap 
            }}
        >
            <Animated.View 
                style={[
                    styles.card,
                    {
                        width: itemSize,
                        height: itemSize * 0.8,
                        borderColor: accentColor,
                        transform: [{ scale: scaleAnim }], // 크기 애니메이션 적용
                        // 호버 시 그림자 강화 (웹/앱 공통 효과 처리를 위한 스타일 병합)
                        ...(isHovered ? styles.cardHovered : {}),
                    }
                ]}
            >
                <View style={[styles.badge, { backgroundColor: accentColor }]}>
                    <Text style={styles.badgeText}>{item.id}</Text>
                </View>

                <Ionicons name="location" size={24} color={accentColor} style={styles.icon} />

                <Text style={styles.cardTitle} numberOfLines={2}>
                    {formatName(item.placeName)}
                </Text>
            </Animated.View>
        </Pressable>
    );
};

// 메인 컴포넌트
const English = () => {
    const { width } = useWindowDimensions();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [places, setPlaces] = useState<Place[]>([]);

    const headerTranslateY = useRef(new Animated.Value(-50)).current;
    const headerOpacity = useRef(new Animated.Value(0)).current;

    const numColumns = useMemo(() => {
        if (width < 600) return 2;   // 모바일 (좁음): 2개
        if (width < 900) return 3;   // 모바일 (넓음) / 태블릿 세로: 3개
        if (width < 1200) return 5;  // 태블릿 가로 / 작은 노트북: 5개
        if (width < 1500) return 6;  // 일반 노트북 / 데스크탑: 6개
        if (width < 1800) return 8;  // 와이드 모니터: 8개
        return 10;                   // 초대형 화면: 10개 (최대값)
    }, [width]);

    const fetchPlaces = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await apiClient.get<Place[]>('/api/places/getPlaces');
            setPlaces(response.data);

            Animated.parallel([
                Animated.spring(headerTranslateY, {
                    toValue: 0,
                    tension: 20,
                    friction: 6,
                    useNativeDriver: true,
                }),
                Animated.timing(headerOpacity, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                })
            ]).start();

        } catch (error) {
            console.error(error);
            crossPlatformAlert('Error', '데이터 로드 실패');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchPlaces(); }, [fetchPlaces]);

    // ✨ 헤더를 별도의 함수(컴포넌트)로 분리
    const renderHeader = () => (
        <Animated.View 
            style={[
                styles.header, 
                { 
                    transform: [{ translateY: headerTranslateY }], // 위에서 아래로 슬라이드
                    opacity: headerOpacity // 서서히 나타남
                }
            ]}
        >
            <Text style={styles.headerTitle}>Where to go?</Text>
            <Text style={styles.headerSubtitle}>학습할 장소를 선택하고 모험을 떠나보세요!</Text>
        </Animated.View>
    );

    const handlePlacePress = (id: number, name: string) => {
        console.log(`Go to ${name}`);
        router.push({
            pathname: "/main/english/[id]",
            params: { id: id, placeName: name },
        });
    };

    if (isLoading) return <ActivityIndicator size="large" style={styles.loader} />;

    return (
        <View style={styles.container}>
            <FlatList
                data={places}
                ListHeaderComponent={renderHeader}

                // 2. 분리한 Card 컴포넌트 렌더링
                renderItem={({ item, index }) => (
                    <PlaceCard 
                        item={item} 
                        index={index} 
                        width={width} 
                        numColumns={numColumns} 
                        onPress={handlePlacePress}
                    />
                )}
                keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
                numColumns={numColumns}
                key={numColumns} 
                contentContainerStyle={styles.listContent}
                columnWrapperStyle={styles.columnWrapper}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F9FC',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
    },
    header: {
        paddingVertical: 30,      // 상하 여백을 좀 더 넉넉하게
        paddingHorizontal: 20,
        backgroundColor: '#F7F9FC', // 리스트 배경과 동일하게 하여 경계 없앰 (더 자연스러움)
        marginBottom: 10,
        // borderBottomWidth 제거: 스크롤 될 때 자연스럽게 이어지도록
        alignItems: 'center',     // 가운데 정렬
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#2C3E50',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#7F8C8D',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 40,
        alignItems: 'center',
    },
    columnWrapper: {
        justifyContent: 'flex-start',
    },
    // 기본 카드 스타일
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,

        // 기본 그림자 (Weak)
        shadowColor: "#000",
        shadowOffset: { width: 4, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        elevation: 2,
    },
    // 호버 시 추가될 스타일 (Shadow 강화)
    cardHovered: {
        shadowOpacity: 0.2, // 그림자가 진해짐
        shadowRadius: 10,   // 그림자가 넓어짐
        elevation: 8,       // 안드로이드 그림자 강화
        zIndex: 1,          // 다른 카드보다 위로 올라오게
    },
    badge: {
        position: 'absolute',
        top: 8,
        left: 8,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    icon: {
        marginBottom: 8,
        opacity: 0.8,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#34495E',
        textAlign: 'center',
        letterSpacing: -0.5,
    },
});

export default English;
