import { Alert, Platform } from "react-native"

/**
 * 웹과 네이티브 환경 모두에서 동작하는 Alert 함수.
 * @param title - 알림창의 제목
 * @param message - 알림창의 내용
 */
const crossPlatformAlert = (title: string, message: string) => {

    if(Platform.OS === 'web') {
        // 웹 환경에서는 브라우저의 기본 alert 함수 사용
        // 브라우저 alert는 파라미터를 하나만 받으므로, 제목과 내용을 합쳐서 노출
        alert(`${title}\n${message}`);

    } else {
        // 모바일(IOS, Android) 환경에서는 React Native의 Alert API를 사용
        Alert.alert(title, message);

    }
}

export default crossPlatformAlert;
