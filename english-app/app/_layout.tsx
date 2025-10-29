// --- 1 & 2. 임포트 및 스플래시 화면 (기존과 동일) ---
import Footer from "../components/common/Footer";
import Header from "../components/common/Header";
import { useFonts } from 'expo-font';
import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, View, Alert, Platform } from "react-native";
import { useUserStore } from "../store/userStore";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {

  // --- 3 & 4. 폰트 로딩 및 Zustand 수화 로직 (기존과 동일) ---
  const [fontsLoaded, fontError] = useFonts({
    'Mulish-Medium': require('../assets/fonts/mulish/Mulish-Medium.ttf'),
    'Mulish-Semibold': require('../assets/fonts/mulish/Mulish-SemiBold.ttf'),
  });
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    const unsubscribe = useUserStore.persist.onFinishHydration(() => setIsHydrated(true));
    if (useUserStore.persist.hasHydrated()) setIsHydrated(true);
    return () => unsubscribe();
  }, []);


  // --- 5. 최종 업그레이드된 '이중 방벽' 페이지 접근 제어 로직 ---
  const { isLoggedIn, user } = useUserStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // 경비원 활동 조건: 모든 로딩(수화, 폰트)이 끝나야만 일을 시작합니다.
    if (!isHydrated || (!fontsLoaded && !fontError)) return;

    // 현재 경로가 어느 구역에 속하는지 정의합니다.
    const inAdminZone = segments[0] === 'admin';
    const inUserZone = segments[0] === 'cart' || segments[0] === 'mypage';

    // --- 1차 방벽: 로그인 여부 검사 ---
    // "보안 구역(관리자 또는 사용자 전용)에 들어가려는데, 로그인을 안 했군요!"
    if (!isLoggedIn && (inAdminZone || inUserZone)) {
      // Alert 없이 즉시 로그인 페이지로 쫓아냅니다.
      router.replace('/auth/login');
      return; // 1차 방벽에서 걸렸으므로, 검사를 즉시 종료합니다.
    }

    // --- 2차 방벽: 관리자 역할 검사 ---
    // 1차 방벽을 통과했다는 것은, 사용자가 '로그인 상태'임을 의미합니다.
    // "관리자 구역에 들어왔는데, 당신은 관리자가 아니군요!"
    if (inAdminZone && user?.role !== 'ADMIN') {
      Alert.alert("접근 불가", "관리자 권한이 없습니다.", [{ text: "확인", onPress: () => router.back() }]);
      return; // 2차 방벽에서 걸렸으므로, 검사를 즉시 종료합니다.
    }

  }, [isLoggedIn, user, segments, isHydrated, fontsLoaded, fontError]);


  // --- 6 & 7. 스플래시 숨기기 및 최종 렌더링 로직 (기존과 동일) ---
  useEffect(() => {
    if ((fontsLoaded || fontError) && isHydrated) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError, isHydrated]);

  if (!fontsLoaded && !fontError || !isHydrated) return null;

  return (
    <View style={styles.layoutContainer}>
      <Header />
      <Stack screenOptions={{ headerShown: false }} />
      <Footer />
    </View>
  );
}

// --- 8. 스타일 정의 ---
const styles = StyleSheet.create({
  layoutContainer: {
    flex: 1, // 화면 전체를 차지하도록 설정
    backgroundColor: '#fff',
    // 'userSelect: none'은 웹에서 텍스트 드래그를 방지하는 스타일입니다.
    // Platform.select를 사용하면 웹에서만 이 스타일이 적용되어 더 안전합니다.
    ...Platform.select({
      web: {
        userSelect: 'none',
      }
    }),
  },
});