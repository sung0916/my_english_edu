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

  // --- [핵심 수정] ---
  // Stack이 최상위 컴포넌트가 되어야 합니다.
  return (
    <Stack
      screenOptions={{
        // 모든 스크린에 공통 헤더를 적용합니다.
        // 이것이 Expo Router에서 공통 레이아웃을 만드는 표준 방식입니다.
        header: () => <Header />,
        
        // Stack 자체의 그림자 등을 제거하여 깔끔하게 만듭니다.
        headerShadowVisible: false,
        
        // 필요하다면 여기서 헤더의 높이 등을 조절할 수 있습니다.
        // headerStyle: { height: 80 }, 
      }}
    >
      {/* 
        특정 페이지만 헤더를 다르게 하고 싶다면, 여기서 screenOptions을 개별적으로 설정할 수 있습니다.
        예: <Stack.Screen name="index" options={{ headerShown: false }} /> 
      */}
    </Stack>
  );
}
