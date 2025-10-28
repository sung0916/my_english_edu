import { Platform, StyleSheet, View } from "react-native";

const TeacherList = () => {

    return (
        <View style = {styles.safeArea}>
            <View style={styles.adminContainer}>
                
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    adminContainer: {
        flex: 1,
        padding: 16,
        paddingTop: Platform.OS === 'android' ? 10 : 0,
    },
});

export default TeacherList;