import GameHeader from "@/components/game/common/GameHeader";
import { useGameStore } from "@/store/gameStore";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const LEVELS = [
    {id: '1', label: 'Level 1', desc: 'Easy', key: 'FIRST'},
    {id: '2', label: 'Level 2', desc: 'Normal', key: 'SECOND'},
    {id: '3', label: 'Level 3', desc: 'Hard', key: 'THIRD'},
    {id: '4', label: 'Level 4', desc: 'Expert', key: 'FOURTH'},
    {id: '5', label: 'Level 5', desc: 'Hell', key: 'FIFTH'},
];

export default function WordPuzzleLobby() {
    const router = useRouter();
    const { setLevel } = useGameStore();

    const handleStartGame = (levelId: string) => {
        setLevel(levelId);
        router.push(`/game/crossWordPuzzle/play?level=${levelId}`);
    };

    return (
        <View style={styles.container}>
            <GameHeader />

            <View style={styles.content}>
                <Text style={styles.title}>Crossword Puzzle</Text>
                <Text style={styles.subtitle}>Choose a game level</Text>
            </View>

            <ScrollView contentContainerStyle={styles.listContainer}>
                {LEVELS.map((lvl) => (
                    <TouchableOpacity
                        key={lvl.id}
                        style={styles.levelCard}
                        onPress={() => handleStartGame(lvl.id)}
                    >
                        <View style={styles.levelBadge}>
                            <Text style={styles.levelNum}>{lvl.id}</Text>
                        </View>

                        <View>
                            <Text style={styles.levelLabel}>{lvl.label}</Text>
                            <Text style={styles.levelDesc}>{lvl.desc}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>

        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9EBEA' }, // 배경색 살짝 다르게
    content: { flex: 1, padding: 20, alignItems: 'center' },
    title: { fontSize: 32, fontWeight: 'bold', color: '#C0392B', marginBottom: 10, marginTop: 20 },
    subtitle: { fontSize: 16, color: '#7F8C8D', marginBottom: 30 },
    listContainer: { width: '100%', alignItems: 'center', paddingBottom: 40 },
    levelCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        width: '100%', maxWidth: 400, padding: 15, borderRadius: 12, marginBottom: 15,
        elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    levelBadge: {
        width: 50, height: 50, borderRadius: 25, backgroundColor: '#E74C3C',
        justifyContent: 'center', alignItems: 'center', marginRight: 15,
    },
    levelNum: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
    levelLabel: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    levelDesc: { fontSize: 14, color: '#888', marginTop: 2 },
});
