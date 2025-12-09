import { Stack } from "expo-router";
import { StyleSheet } from "react-native";

export default function MazeAdventure() {

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="play" options={{ gestureEnabled: false }} />
        </Stack>
    );
};

const styles = StyleSheet.create({

});
