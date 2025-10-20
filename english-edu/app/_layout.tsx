import Header from "@/components/common/Header";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name = "index"
        options = {{
          header: () => <Header />,
        }}
      />

      {/* 다른 페이지 자리 */}
    </Stack>
  );
}