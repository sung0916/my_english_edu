import GameHeader from "@/components/game/common/GameHeader";
import MazeHelpModal from "@/components/game/mazeAdventure/MazeHelpModal";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MazeAdventureLobby() {
    const router = useRouter();
    const GAME_ID = 3;  // 백엔드 Game 엔티티에 저장된 ID
    const LEVELS = ['FIRST', 'SECOND', 'THIRD'];  // MazeAdventure의 게임 레벨
    const [isHelpModalVisible, setIsHelpModalVisible] = useState(false);

    const handleLevelSelect = (level: string) => {
        
        router.push({
            pathname: '/game/mazeAdventure/play',  // 파일 경로
            params: {gameId: GAME_ID, level},      // 파라미터
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <GameHeader />

            <View style={styles.content}>
                <Text style={styles.title}>Maze Adventure 🚧</Text>
                <Text style={styles.subtitle}>Navigate & Command</Text>

                <View style={styles.levelContainer}>
                    {LEVELS.map((level, index) => (
                        <Pressable
                            key={level}
                            style={[styles.levelButton, index === 2 && styles.levelButtonThird]}
                            onPress={() => handleLevelSelect(level)}
                        >
                            <Text style={styles.levelText}>
                                {index === 0 && "Level 1 (Easy)"}
                                {index === 1 && "Level 2 (Normal)"}
                                {index === 2 && "Level 3 (Hard)"}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                <TouchableOpacity
                    style={styles.helpButton}
                    onPress={() => setIsHelpModalVisible(true)}
                    >
                    <Ionicons name="help-circle" size={20} color="#0EA5E9" />
                    <Text style={styles.helpButtonText}>Guide</Text>
                </TouchableOpacity>
            </View>

            <MazeHelpModal 
                visible={isHelpModalVisible}
                onClose={() => setIsHelpModalVisible(false)}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#E0F2FE', // 밝은 배경색으로 변경
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 50,
    },
    title: { 
        fontSize: 32, 
        fontWeight: 'bold', 
        color: '#075985', // 더 진한 파란색
        marginBottom: 10 
    },
    subtitle: { 
        fontSize: 18, 
        color: '#475569',
        marginBottom: 40 
    },
    levelContainer: { width: '80%', gap: 15, maxWidth: 400, },
    levelButton: {
        backgroundColor: '#0EA5E9', // 하늘색 버튼
        paddingVertical: 18, // 조금 더 키움
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 4 },
        elevation: 5,
    },
    // Level 3 전용 스타일 (난이도 강조)
    levelButtonThird: {
        backgroundColor: '#EF4444', // 빨간색 강조
        shadowColor: '#EF4444', 
        shadowOpacity: 0.25,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 4 },
    },
    levelText: { 
        color: 'white', 
        fontSize: 18, 
        fontWeight: 'bold' 
    },
    helpButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 40,
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: 'rgba(14, 165, 233, 0.1)', // 버튼 배경색 (투명한 하늘색)
        borderWidth: 1,
        borderColor: '#0EA5E9',
    },
    helpButtonText: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '600',
        color: '#0EA5E9',
    },
});
