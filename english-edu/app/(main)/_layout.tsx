import { Slot } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function MainLayout() {
    return (
        <View style={styles.mainContainer}>
            <Slot />
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
    },
});