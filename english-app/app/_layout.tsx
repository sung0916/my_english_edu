import { useUserStore } from '@/store/userStore';
import '@toast-ui/editor/toastui-editor.css';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from 'react';
import { Alert } from "react-native"; // View, Platform, StyleSheet는 더 이상 필요 없음
import Header from '../components/common/Header';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {

  const [fontsLoaded, fontError] = useFonts({
    'Mulish-Medium': require('../assets/fonts/Mulish-Medium.ttf'),
    'Mulish-Semibold': require('../assets/fonts/Mulish-SemiBold.ttf'),
  });
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const unsubscribe = (useUserStore as any).persist.onFinishHydration(() => setIsHydrated(true));
    if ((useUserStore as any).persist.hasHydrated()) setIsHydrated(true);
    return () => unsubscribe();
  }, []);

  const { isLoggedIn, user } = useUserStore();
  const router = useRouter();
  const segments = useSegments();
  const isGameRoute = segments[0] === 'game'; // 경로가 game 폴더에 있는지 확인(0으로 명시적 적용)

  useEffect(() => {
    if (!isHydrated || (!fontsLoaded && !fontError)) return;
    const first = segments[0];
    const second = segments[1];
    const inAdminZone = first === 'admin';
    const inUserZone = first === 'auth' && (second=== 'cart' || second === 'place');

    if (!isLoggedIn && (inAdminZone || inUserZone)) {
      router.replace('/auth/login');
      return;
    }
    if (inAdminZone && user?.role !== 'ADMIN') {
      Alert.alert("접근 불가", "관리자 권한이 없습니다.", [{ text: "확인", onPress: () => router.back() }]);
      return;
    }
  }, [isLoggedIn, user, segments, isHydrated, fontsLoaded, fontError]);

  useEffect(() => {
    if ((fontsLoaded || fontError) && isHydrated) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError, isHydrated]);

  if (!fontsLoaded && !fontError || !isHydrated) return null;

  return (
    <Stack  // Stack이 최상위 컴포넌트
      screenOptions={{
        header: isGameRoute ? undefined : () => <Header />,    // 모든 스크린에 공통 헤더를 적용(game 폴더 경로 제외)
        headerShadowVisible: false,  // Stack 자체의 그림자 등을 제거
        // 필요하다면 여기서 헤더의 높이 등을 조절 (headerStyle: { height: 80 })
      }}
    >
      {/* 특정 페이지만 헤더를 다르게 하기 위해, screenOptions을 개별적으로 설정 */}
      <Stack.Screen
        name="game"
        options={{
          headerShown: false,  // 헤더 영역 제거
          header: () => null   // 만의 하나 커스텀 헤더가 남지 않도록 null 처리
        }}
      />
    </Stack>
  );
}
