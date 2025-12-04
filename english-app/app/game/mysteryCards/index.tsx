import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MysteryCardsLobby() {
    const router = useRouter();
    const GAME_ID = 2;  // DB에 저장된 MYSTERYCARDS 게임 ㅑㅇ
    const handleLevelSelect = (level: string) => {
        router.push({
            pathname: '/game/mysteryCards/play',
            params: {gameId: GAME_ID, level},
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Mystery Cards 🃏🃏🃏🃏</Text>
            <Text style={styles.subtitle}>Choose your level</Text>

            <View style={styles.levelContainer}>
                {['FIRST', 'SECOND', 'THIRD'].map((level, index) => (
                    <Pressable
                        key={level}
                        style={styles.levelButton}
                        onPress={() => handleLevelSelect(level)}
                    >
                        <Text style={styles.levelText}>Level {index + 1}</Text>
                    </Pressable>
                ))}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#F0F9FF', 
        alignItems: 'center', 
        justifyContent: 'center' 
    },
    title: { 
        fontSize: 32, 
        fontWeight: 'bold', 
        color: '#1E3A8A', 
        marginBottom: 10 
    },
    subtitle: { 
        fontSize: 18, 
        color: '#64748B',
        marginBottom: 40 
    },
    levelContainer: { width: '80%', gap: 15 },
    levelButton: {
        backgroundColor: '#3B82F6',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    levelText: { 
        color: 'white', 
        fontSize: 18, 
        fontWeight: 'bold' 
    },
});
