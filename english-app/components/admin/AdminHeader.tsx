import { Feather } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useUIStore } from "../../store/uiStore";

const AdminHeader = () => {
    const {width} = useWindowDimensions();
    const isMobile = width < 768;
    const {toggleSidebar} = useUIStore();

    return (
        <View style={styles.adminHeader}>
            {isMobile && (
                <Pressable onPress={toggleSidebar} style={styles.menuButton}>
                    <Feather name="menu" size={28} color="black" />
                </Pressable>
            )}

            <Text style={styles.title}>관리자 페이지</Text>
            <View style={{width: 20}} />
        </View>
    );
};

const styles = StyleSheet.create({
    adminHeader: {
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

export default AdminHeader;