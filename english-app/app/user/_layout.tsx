import UserHeader from "@/components/user/UserHeader";
import UserSidebar from "@/components/user/UserSidebar";
import { useUIStore } from "@/store/uiStore";
import { Slot, usePathname } from "expo-router";
import { Modal, Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const UserLayout = () => {
    const { width } = useWindowDimensions();
    const pathname = usePathname();
    const isMobile = width < 768;
    const { isSidebarOpen, toggleSidebar } = useUIStore();
    const isCartPage = pathname.includes('cart');

    return (
        <SafeAreaView style={styles.safeArea}>
            <UserHeader />

            <View style={styles.layoutContainer}>
                {!isMobile && !isCartPage && <UserSidebar />}

                {isMobile && (
                    <Modal
                        visible={isSidebarOpen}
                        animationType="fade"
                        onRequestClose={toggleSidebar}
                        transparent={true}
                    >
                        <Pressable 
                            style={styles.modalBackdrop}
                            onPress={toggleSidebar}
                        >
                            <View style={styles.modalContent}>
                                <UserSidebar />
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
    layoutContainer: {
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

export default UserLayout;
