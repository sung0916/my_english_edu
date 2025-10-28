import Footer from "../components/common/Footer";
import Header from "../components/common/Header";
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useUserStore } from "../store/userStore";

// 스플래시 화면 실종 방지
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  
  // 폰트 훅 사용
  const [fontsLoaded, fontError] = useFonts({
    'Mulish-Medium': require('../assets/fonts/mulish/Mulish-Medium.ttf'),
    'Mulish-Semibold': require('../assets/fonts/mulish/Mulish-SemiBold.ttf'),
  });

  // 3. 스토어의 수화(hydration) 상태를 관리할 상태 추가
  const [isHydrated, setIsHydrated] = useState(false);

  // 4. 앱이 시작될 때 딱 한 번만 실행
  useEffect(() => {
    // Zustand persist가 AsyncStorage에서 데이터를 모두 불러왔는지 확인
    const unsubscribe = useUserStore.persist.onFinishHydration(() => {
      setIsHydrated(true); // 수화가 완료되면 상태를 true로 변경
    });

    // Zustand v4 최신 버전에서는 이미 수화가 끝난 상태일 수 있으므로,
    // hasHydrated 상태를 직접 체크하는 것이 더 안정적입니다.
    if (useUserStore.persist.hasHydrated()) {
      setIsHydrated(true);
    }

    return () => {
      unsubscribe(); // 컴포넌트 언마운트 시 리스너 정리
    };
  }, []);

  useEffect(() => {
    // 폰트 로딩과 스토어 수화가 모두 완료되었을 때 스플래시 화면을 숨깁니다.
    if ((fontsLoaded || fontError) && isHydrated) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, isHydrated]);

  // 폰트 로딩과 수화가 완료될 때까지는 아무것도 렌더링하지 않음 (로딩 화면)
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    // 전체 화면을 Flexbox View로 감쌉니다.
    <View style={styles.layoutContainer}>
      <Header /> 

      {/* 
        Stack 네비게이터가 남은 공간을 모두 차지하도록 설정합니다.
        이제 Stack 자체의 헤더는 사용하지 않으므로 headerShown: false로 설정합니다.
      */}
      <Stack screenOptions={{ headerShown: false }} />

      <Footer />
    </View>
  );
}

// 레이아웃을 위한 스타일 추가
const styles = StyleSheet.create({
  layoutContainer: {
    flex: 1,
    backgroundColor: '#fff',
    userSelect: 'none',
  },
});