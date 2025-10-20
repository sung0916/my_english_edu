import Footer from "@/components/common/Footer";
import Header from "@/components/common/Header";
import { Stack } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function RootLayout() {
  return (
    // 2. 전체 화면을 Flexbox View로 감쌉니다.
    <View style={styles.layoutContainer}>
      {/* Header 컴포넌트 */}
      <Header /> 
      
      {/* 
        3. Stack 네비게이터가 남은 공간을 모두 차지하도록 설정합니다.
           이제 Stack 자체의 헤더는 사용하지 않으므로 headerShown: false로 설정합니다.
      */}
      <Stack screenOptions={{ headerShown: false }} />

      {/* Footer 컴포넌트 */}
      <Footer />
    </View>
  );
}

// 4. 레이아웃을 위한 스타일 추가
const styles = StyleSheet.create({
  layoutContainer: {
    flex: 1,
    backgroundColor: '#fff', // 기본 배경색
  },
});