import AdminHeader from "@/components/admin/AdminHeader";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { useUIStore } from "@/store/uiStore";
import { Slot } from "expo-router";
import { Modal, Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const AdminLayout = () => {
    const {width} = useWindowDimensions();
    const isMobile = width < 768;
    const {isSidebarOpen, toggleSidebar} = useUIStore();

    return (
        <SafeAreaView style={styles.safeArea}>
            <AdminHeader />
            <View style={styles.adminLayoutContainer}>
                {!isMobile && <AdminSidebar />}

                {isMobile && (
                    <Modal
                        visible={isSidebarOpen}
                        animationType="fade"
                        onRequestClose={toggleSidebar}
                        transparent={true}
                    >
                        <Pressable style={styles.modalBackdrop} onPress={toggleSidebar}>
                            <View style={styles.modalContent}>
                                <AdminSidebar />
                            </View>
                        </Pressable>
                    </Modal>
                )}

                <View style={styles.content}>
                    <Slot />
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    adminLayoutContainer: {
        flex: 1,
        flexDirection: 'row',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        height: '100%',
        width: 200,
        backgroundColor: '#f8f9fa',
    },
});

export default AdminLayout;