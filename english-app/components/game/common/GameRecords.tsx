import { GameRecordDto } from "@/api/gameApi";
import { Ionicons } from "@expo/vector-icons";
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
    visible: boolean;
    onClose: () => void;
    records: GameRecordDto[];  // API에서 받아온 데이터를 넘김
}

export default function GameRecordsModal({ visible, onClose, records }: Props) {
    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    const formatDisplayScore = (gameName: string, score: number) => {
        const name = gameName.toLowerCase().replace(/\s/g, '');

        // Maze Adventure & Crossword Puzzle
        if (name.includes('maze') || name.includes('crossword')) {
            if (score >= 3) {
                return `Level ${score} Clear 🎉`;
            } else {
                return `Level ${score} Clear`;
            }
        }

        // Falling Words & Mystery Cards
        if (name.includes('falling') || name.includes('mystery')) {
            if (score == 100) {
                return `${score} pts 🎉`
            } else {
                return `${score} pts`;
            } 
        }

        // 그 외 기본
        return score.toString();
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.header}>
                        <Text style={styles.title}>🏆 Best Records 🏆</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={28} color="#333" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.tableHeader}>
                        <Text style={[styles.col, styles.colGame]}>Game</Text>
                        <Text style={[styles.col, styles.colScore]}>Record</Text> {/* 제목 변경 Score -> Record */}
                        <Text style={[styles.col, styles.colDate]}>Date</Text>
                    </View>

                    {records.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text>There is no data</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={records}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item }) => (
                                <View style={styles.row}>
                                    {/* 게임 이름 */}
                                    <Text style={[styles.col, styles.colGame]} numberOfLines={1}>
                                        {item.gameName || `Game ${item.gameId}`}
                                    </Text>

                                    {/* [수정] 점수 표시 로직 적용 */}
                                    <Text style={[styles.col, styles.colScore, { fontWeight: 'bold', color: '#2980B9' }]}>
                                        {formatDisplayScore(item.gameName || '', item.highScore)}
                                    </Text>

                                    {/* 날짜 */}
                                    <Text style={[styles.col, styles.colDate]}>
                                        {formatDate(item.updatedAt)}
                                    </Text>
                                </View>
                            )}
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '90%',
        maxHeight: '80%',
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 2,
        borderBottomColor: '#eee',
        paddingBottom: 8,
        marginBottom: 8,
    },
    row: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    col: { fontSize: 16 },
    colGame: { flex: 2, fontWeight: '600' },
    colScore: { flex: 1, textAlign: 'center', color: '#E67E22', fontWeight: 'bold' },
    colDate: { flex: 1.5, textAlign: 'right', fontSize: 12, color: '#888' },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
    },
});
