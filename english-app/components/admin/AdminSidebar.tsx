import { Link, usePathname } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

const menuItems = [
    { name: 'Student List', href: '/admin/studentList' },
    { name: 'Teacher List', href: '/admin/teacherList' },
    { name: 'Permit-required List', href: '/admin/permitList' },
    { name: 'Board List', href: '/admin/boardList' },
    { name: 'Chart', href: '/admin/chart' },
    { name: '', href: '/' },
];

const AdminSidebar = () => {
    const pathname = usePathname();

    return (
        <View style={styles.sidebarContainer}>
            {menuItems.map((item) => {
                const isActive = pathname === item.href;

                return (
                    <Link href={item.href} asChild key={item.name}>
                        <Pressable>
                            <Text style={[styles.menuItem, isActive && styles.activeMenuItem]}>
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
        fontFamily: 'Mulish-Bold',
        textAlign: 'center',
    },
    activeMenuItem: {
        color: '#007bff', 
        fontWeight: 'bold',
    },
});

export default AdminSidebar;