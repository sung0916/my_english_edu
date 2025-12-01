import { GameRecord } from "@/store/gameStore";
import { Ionicons } from "@expo/vector-icons";
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
    visible: boolean;
    onClose: () => void;
    records: GameRecord[];  // API에서 받아온 데이터를 넘김
}

export default function GameRecordsModal({ visible, onClose, records }: Props) {

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.header}>  {/* 모달 헤더 */}
                        <Text style={styles.title}>🏆 Best Records 🏆</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={28} color="#333" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.tableHeader}>  {/* 기록 테이블 헤더 */}
                        <Text style={[styles.col, styles.colGame]}>Game</Text>
                        <Text style={[styles.col, styles.colScore]}>Score</Text>
                        <Text style={[styles.col, styles.colDate]}>Date</Text>
                    </View>

                    {/* 기록 리스트 */}
                    {records.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text>기록이 없습니다.</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={records}
                            keyExtractor={(item, index) => index.toString()}

                            renderItem={({item}) => (
                                <View style={styles.row}>
                                    <Text style={[styles.col, styles.colGame]}>{item.gameName}</Text>
                                    <Text style={[styles.col, styles.colScore]}>{item.highScore}</Text>
                                    <Text style={[styles.col, styles.colDate]}>{item.updatedAt}</Text>
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
