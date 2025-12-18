import { Stack } from "expo-router";

export default function GameRootLayout() {
    
    // 헤더 없애는 역할만 함
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="fallingWords" />
            <Stack.Screen name="mysteryCards" />
            <Stack.Screen name="mazeAdventure" />
            <Stack.Screen name="crossWordPuzzle" />
        </Stack>
    );
}
