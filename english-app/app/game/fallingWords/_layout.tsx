import { Stack } from "expo-router";
import { StyleSheet } from "react-native";

export default function FallingWordsLayout() {

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" /> {/* 로비 */}
            <Stack.Screen name="play" options={{ gestureEnabled: false }} /> {/* 인게임 */}
        </Stack>
    );
}

const styles = StyleSheet.create({

});
