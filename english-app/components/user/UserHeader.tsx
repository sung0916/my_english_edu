import { useUIStore } from "@/store/uiStore";
import { Feather } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";

const UserHeader = () => {
    const { width } = useWindowDimensions();
    const isMobile = width < 768;
    const { toggleSidebar } = useUIStore();

    return (
        <View style={styles.header}>
            {isMobile && (
                <Pressable onPress={toggleSidebar} style={styles.menuButton}>
                    <Feather name="menu" size={28} color="black" />
                </Pressable>
            )}

            <Text style={styles.title}>My Page</Text>

            <View style={{width: 44}} />
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#dee2e6',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    menuButton: {
        padding: 8,
    },
});

export default UserHeader;
