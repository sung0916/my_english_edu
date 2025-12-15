import { Ionicons } from "@expo/vector-icons";
import { Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
    visible: boolean;
    onClose: () => void;
}

// 커맨드 설명
const commands = [
    { cmd: 'Move + [up | down | left | right]', desc: 'Moves you in the specified direction until a wall or a choice point reached'},
    { cmd: 'Return', desc: 'Moves you back to the location you just came from'},
    { cmd: 'Take Key', desc: 'Collect the Key allowing you to open a locked door'},
    { cmd: 'Open Door', desc: 'Unlock and open the door at your current position'},
    { cmd: 'Turn on Flashlight ', desc: 'Activate the Flashlight to gradually increase your visible map area'},
    { cmd: 'Run away', desc: 'Command needed to quickly escape when encountering a Ghost Trap in 15s'},
    { cmd: 'Jump', desc: 'Command needed to quickly leap over a Hole Trap in 10s'},
];

export default function MazeHelpModal({ visible, onClose }: Props) {

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalWrapper}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Command Guide</Text>
                        
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close-circle" size={30} color="#3B82F6" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.commandList}>
                        {commands.map((item, index) => (
                            <View key={index} style={styles.commandItem}>
                                <Text style={styles.commandText}>{item.cmd}</Text>
                                <Text style={styles.descriptionText}>{item.desc}</Text>
                            </View>
                        ))}

                        <View style={{ height: 30 }} />
                    </ScrollView>

                    <Text style={styles.footerText}>
                        Tip: All commands are case-insensitive.
                    </Text>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    modalWrapper: {
        width: Platform.OS === 'web' ? '60%' : '90%', // 웹에서 크기 조정
        maxWidth: 650,
        backgroundColor: 'white',
        borderRadius: 15,
        elevation: 10,
        maxHeight: '80%',
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        paddingBottom: 15,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    closeButton: {
        padding: 5,
    },
    commandList: {
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    commandItem: {
        marginBottom: 15,
        padding: 15,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
    },
    commandText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1D4ED8',
        marginBottom: 5,
    },
    descriptionText: {
        fontSize: 14,
        color: '#374151',
    },
    footerText: {
        paddingHorizontal: 20,
        paddingVertical: 5,
        marginTop: 15,
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    }
});
