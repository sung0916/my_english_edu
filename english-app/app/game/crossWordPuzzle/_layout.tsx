import { Stack } from "expo-router";

export default function WordPuzzleLayout() {

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="play" options={{ gestureEnabled: false }} />
        </Stack>
    );
}
