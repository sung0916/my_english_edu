import { Stack } from "expo-router";

export default function GameRootLayout() {
    
    // 헤더 없애는 역할만 함
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="fallingWords" />
            {/* 다른 게임들 추후 적용 */}
        </Stack>
    );
}
