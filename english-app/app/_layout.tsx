import Header from "../components/common/Header";
import { useFonts } from 'expo-font';
import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, View, Alert, Platform, ScrollView } from "react-native";
import { useUserStore } from "../store/userStore";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {

  // 폰트 로딩 및 Zustand 수화 로직
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

  // 최종 업그레이드된 '이중 방벽' 페이지 접근 제어 로직
  const { isLoggedIn, user } = useUserStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // 경비원 활동 조건: 모든 로딩(수화, 폰트)이 끝나야만 시작
    if (!isHydrated || (!fontsLoaded && !fontError)) return;

    const first = segments[0];
    const second = segments[1];

    // 현재 경로가 어느 구역에 속하는지 정의
    const inAdminZone = first === 'admin';
    const inUserZone = first === 'auth' && (second=== 'cart' || second === 'mypage');

    // 로그인 여부 검사
    if (!isLoggedIn && (inAdminZone || inUserZone)) {
      router.replace('/auth/login');
      return;
    }

    // 관리자 역할 검사
    if (inAdminZone && user?.role !== 'ADMIN') {
      Alert.alert("접근 불가", "관리자 권한이 없습니다.", [{ text: "확인", onPress: () => router.back() }]);
      return;
    }

  }, [isLoggedIn, user, segments, isHydrated, fontsLoaded, fontError]);

  // 스플래시 숨기기 및 최종 렌더링 로직
  useEffect(() => {
    if ((fontsLoaded || fontError) && isHydrated) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError, isHydrated]);

  if (!fontsLoaded && !fontError || !isHydrated) return null;

  return (
    <View style={styles.layoutContainer}>
      <Header />
      {/* 이제 Stack이 직접 View의 자식이 됩니다. */}
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
}

const styles = StyleSheet.create({
  layoutContainer: {
    flex: 1, // 화면 전체를 차지하도록 설정
    backgroundColor: '#fff',
    // 웹에서만 적용
    ...Platform.select({
      web: {
        userSelect: 'none',
      }
    }),
  },
});
