import { Href, Link, usePathname } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

const menuItems = [
    { name: 'Places', href: '/user/place' },
    { name: 'Results', href: '/user/result' },
    { name: 'Payment History', href: '/user/payment' },
    { name: 'Edit Profile', href: '/auth/confirmPasswordForEdit' },
    { name: 'Withdraw', href: '/auth/confirmPasswordForWithdraw', isDanger: true },
];

const UserSidebar = () => {
    const pathname = usePathname();

    return (
        <View style={styles.sidebarContainer}>
            {menuItems.map((item) => {
                const isActive = pathname.startsWith(item.href);

                return (
                    <Link href={item.href as Href} asChild key={item.name}>
                        <Pressable>
                            <Text
                                style={[
                                    styles.menuItem,
                                    isActive && styles.activeMenuItem,
                                    item.isDanger && styles.dangerText
                                ]}
                            >
                                {item.name}
                            </Text>
                        </Pressable>
                    </Link>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    sidebarContainer: {
        width: 200,
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderRightWidth: 1,
        borderRightColor: '#dee2e6',
    },
    menuItem: {
        fontSize: 16,
        paddingVertical: 12,
        color: '#495057',
        // fontFamily: 'Mulish-Bold', // 폰트는 프로젝트에 맞게 조절
        fontWeight: '600',
        textAlign: 'center',
    },
    activeMenuItem: {
        color: '#007bff',
        fontWeight: 'bold',
    },
    // 탈퇴 메뉴를 위한 빨간색 텍스트 스타일
    dangerText: {
        color: '#dc3545', // 빨간색
    },
});

export default UserSidebar;
