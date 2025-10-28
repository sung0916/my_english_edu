import { Href, Link, usePathname } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

const menuItems = [
    { name: 'Student List', href: '/studentList' },
    { name: 'Teacher List', href: '/teacherList' },
    { name: 'Board List', href: '/boardList' },
    { name: 'Chart', href: '/chart' },
    { name: '', href: '/' },
    { name: '', href: '/' },
];

const AdminSidebar = () => {
    const pathname = usePathname();

    return (
        <View style={styles.sidebarContainer}>
            {menuItems.map((item) => {
                const isActive = pathname === item.href;

                return (
                    <Link href={item.href as Href} asChild key={item.name}>
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
        fontSize: 17,
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