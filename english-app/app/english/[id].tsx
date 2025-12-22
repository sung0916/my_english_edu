import EduHeader from "@/components/english/common/EduHeader";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import * as Speech from 'expo-speech';
import { useEffect, useState } from "react";
import { ImageBackground, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// 1. 데이터 인터페이스 (TODO: 실제 데이터 넣은 후 백엔드 DTO와 일치 시키는 작업 필요)
interface PlaceObject {
    id: number;
    word: string;
    meaning: string;
    position: { top: number; left: number; width: number; height: number; }
}

interface PlaceData {
    id: number;
    name: string;
    bgImage: any;  // TODO: 추후 string(URL)로 수정 필요
    objects: PlaceObject[];
}

// 2. 개발용 가짜 데이터
const MOCK_DB: Record<string, PlaceData> = {
    "1": {
        id: 1,
        name: "classroom",
        bgImage: { uri: "https://img.freepik.com/free-vector/kitchen-interior-design-with-furniture-decoration_1308-62040.jpg" },
        objects: [
            {
                id: 101,
                word: "Refrigerator",
                meaning: "냉장고",
                position: { top: 20, left: 5, width: 18, height: 45 }
            },
            {
                id: 102,
                word: "kitchen",
                meaning: "부엌",
                position: { top: 60, left: 30, width: 25, height: 25 }
            },
            {
                id: 103,
                word: "supermarket",
                meaning: "수퍼마켓",
                position: { top: 25, left: 65, width: 15, height: 20 }
            },
        ]
    }
};

// 3. 메인 콤퍼넌트
const PlaceDetail = () => {
    const { id, placeName } = useLocalSearchParams();
    const router = useRouter();
    const title = typeof placeName === 'string' ? placeName : `Place #${id}`;

    // 상태 관리
    const [placeData, setPlaceData] = useState<PlaceData | null>(null);
    const [selectedObjectId, setSelectedObjectId] = useState<number | null>(null);
    const [isGameModalVisible, setGameModalVisible] = useState(false);

    // 데이터 로드 (API 연동)
    useEffect(() => {
        const targetId = typeof id === 'string' ? id : '1';
        const data = MOCK_DB[targetId] || MOCK_DB["1"];
        setPlaceData(data);
    }, [id]);

    // TTS 읽기
    const playSound = (text: string) => {
        Speech.stop();  // 기존 음성 중단
        Speech.speak(text, { language: 'en', pitch: 1.0, rate: 0.9 });
    };

    // ❗️객체 클릭 핸들러
    const handleObjectPress = (obj: PlaceObject) => {
        if (selectedObjectId === obj.id) {
            // 더블 클릭 (이미 선택된 상태에서 다시 클릭) -> 이동 또는 상세 액션
            console.log(`Double Clicked! Move to detail of ${obj.word}`);
            // alert(`Go to ${obj.word} World! 🚀`); // 여기에 상세 페이지 이동 로직 추가

        } else {
            setSelectedObjectId(obj.id);  // 첫클릭 -> 선택 및 소리 재생
            playSound(obj.word);
        }
    };

    // 배경 클릭 시 선택 해제
    const handleBackgroundPress = () => {
        setSelectedObjectId(null);
    };

    if (!placeData) return <View style={styles.loading}><Text>Loading...</Text></View>

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <EduHeader title={title} />

            <View style={styles.contentContainer}>
                {/* 배경 이미지 (Touch Zone이 아닌 곳 누르면 선택 해제) */}
                <Pressable style={styles.bgContainer} onPress={handleBackgroundPress}>
                    <ImageBackground source={placeData.bgImage} style={styles.bgImage} resizeMode="cover">
                        {/* 핫스팟 (클릭 가능한 투명 버튼들) 렌더링 */}
                        {placeData.objects.map((obj) => (
                            <TouchableOpacity
                                key={obj.id}
                                style={[
                                    styles.hotspot,
                                    {
                                        top: `${obj.position.top}%`,
                                        left: `${obj.position.left}%`,
                                        width: `${obj.position.width}%`,
                                        height: `${obj.position.height}%`,

                                        // 선택되면 테두리와 그림자 효과
                                        borderColor: selectedObjectId === obj.id ? 'white' : 'transparent',
                                        borderWidth: selectedObjectId === obj.id ? 4 : 0,
                                        backgroundColor: selectedObjectId === obj.id ? 'rgba(255,255,255,0.2)' : 'transparent',
                                    }
                                ]}
                                onPress={(e) => {
                                    e.stopPropagation();  // 배경 클릭 이벤트 전파 방지
                                    handleObjectPress(obj);
                                }}
                                activeOpacity={0.7}
                            >
                                {/* 선택되었을 때만 이름표 띄우기 */}
                                {selectedObjectId === obj.id && (
                                    <View style={styles.labelTag}>
                                        <Text style={styles.labelText}>{obj.word}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </ImageBackground>
                </Pressable>

                {/* 🚀 우측 로켓 사이드바 (Navigation) */}
                <View style={styles.rocketSidebar}>
                    <View style={styles.rocketBody}>
                        <Text style={styles.rocketTitle}>Menu</Text>

                        {/* Activity Buttons */}
                        {['Activity 1', 'Activity 2', 'Activity 3'].map((act, idx) => (
                            <TouchableOpacity
                                key={idx}
                                style={styles.rocketButton}
                                onPress={() => setGameModalVisible(true)}
                            >
                                <Text style={styles.rocketBtnText}>{act}</Text>
                            </TouchableOpacity>
                        ))}

                        <View style={styles.divider} />

                        <TouchableOpacity style={styles.rocketButtonExit} onPress={() => window.close()}>
                            <Text style={styles.rocketBtnText}>Quit</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 🎮 게임 선택 모달 (Overlay) */}
                <Modal
                    transparent={true}
                    visible={isGameModalVisible}
                    animationType="fade"
                    onRequestClose={() => setGameModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.gamePopup}>
                            <Text style={styles.popupTitle}>Choose the Level</Text>
                            <View style={styles.levelContainer}>
                                <TouchableOpacity style={styles.levelBtn} onPress={() => alert('Start Level 1')}>
                                    <Text style={styles.levelText}>Level 1</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.levelBtn} onPress={() => alert('Start Level 2')}>
                                    <Text style={styles.levelText}>Level 2</Text>
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity
                                style={styles.closeBtn}
                                onPress={() => setGameModalVisible(false)}
                            >
                                <Ionicons name="close-circle" size={40} color="#FF6B6B" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, flexDirection: 'column' },
    contentContainer: { // 본문 영역 (헤더 아래 공간을 꽉 채움)
        flex: 1, 
        flexDirection: 'row' // 본문 내부는 가로 배치 (배경 + 로켓)
    },
    loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    // 배경
    bgContainer: { flex: 1 }, // 사이드바 공간 제외 나머지 채움
    bgImage: { width: '100%', height: '100%' },

    // 핫스팟 (사물 버튼)
    hotspot: {
        position: 'absolute',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        // 디버깅용 (개발할 때만 보이게 하려면 아래 주석 해제)
        // backgroundColor: 'rgba(255, 0, 0, 0.3)', 
    },
    labelTag: {
        position: 'absolute',
        bottom: -30,
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
    },
    labelText: { color: 'white', fontWeight: 'bold' },

    // 🚀 로켓 사이드바 스타일
    rocketSidebar: {
        width: 120,
        height: '100%',
        backgroundColor: '#2C3E50', // 나중에 로켓 이미지로 교체
        paddingVertical: 20,
        alignItems: 'center',
        borderLeftWidth: 3,
        borderLeftColor: '#34495E',
        zIndex: 10,
    },
    rocketBody: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 15,
    },
    rocketTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    rocketButton: {
        width: '80%',
        paddingVertical: 10,
        backgroundColor: '#4ECDC4',
        borderRadius: 20,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    rocketButtonExit: {
        width: '80%',
        paddingVertical: 10,
        backgroundColor: '#FF6B6B',
        borderRadius: 20,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    rocketBtnText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
    },
    divider: {
        height: 2,
        width: '80%',
        backgroundColor: 'rgba(255,255,255,0.3)',
        marginVertical: 10,
    },

    // 🎮 게임 팝업 스타일
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    gamePopup: {
        width: 400,
        height: 300,
        backgroundColor: 'white',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 5,
        borderColor: '#FFD93D',
    },
    popupTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 30,
    },
    levelContainer: {
        flexDirection: 'row',
        gap: 20,
    },
    levelBtn: {
        paddingHorizontal: 30,
        paddingVertical: 15,
        backgroundColor: '#6C5CE7',
        borderRadius: 15,
    },
    levelText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    closeBtn: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
});

export default PlaceDetail;
