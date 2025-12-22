import { Stack } from "expo-router";

export default function EnglishLayout() {

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="[id]" />
        </Stack>
    );
}
