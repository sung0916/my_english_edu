import { Alert, Platform } from "react-native";

/**
 * 웹과 네이티브 환경 모두에서 동작하는 Alert 함수.
 * @param title - 알림창의 제목
 * @param message - 알림창의 내용
 */
export const crossPlatformAlert = (title: string, message: string) => {

    if(Platform.OS === 'web') {
        // 웹 환경에서는 브라우저의 기본 alert 함수 사용
        // 브라우저 alert는 파라미터를 하나만 받으므로, 제목과 내용을 합쳐서 노출
        alert(`${title}\n${message}`);

    } else {
        // 모바일(IOS, Android) 환경에서는 React Native의 Alert API를 사용
        Alert.alert(title, message);

    }
}

/**
 * [새로운 함수] 웹과 네이티브 환경 모두에서 동작하는 확인(Confirm) 함수.
 * @param title - 확인창의 제목
 * @param message - 확인창의 내용
 * @param onConfirm - '확인' 또는 '탈퇴' 버튼을 눌렀을 때 실행될 콜백 함수
 */
export const crossPlatformConfirm = (
    title: string, 
    message: string, 
    onConfirm: () => void, // 확인 시 실행할 함수를 파라미터로 받음
    onCancel?: () => void  // '?'를 붙여서 선택적 파라미터로 설정
) => {
    if (Platform.OS === 'web') {
        // 웹에서는 window.confirm 사용
        const result = window.confirm(`${title}\n${message}`);
        if (result) {
            // 사용자가 '확인'을 누르면 onConfirm 콜백 실행
            onConfirm();
        } else {
            onCancel?.();
        }
    } else {
        // 네이티브에서는 기존 Alert.alert의 버튼 배열 사용
        Alert.alert(
            title,
            message,
            [
                {
                    text: "취소",
                    style: "cancel",
                    onPress: onCancel, 
                },
                {
                    text: "확인", // 버튼 텍스트는 '확인'으로 통일 (상황에 따라 변경 가능)
                    onPress: onConfirm, // '확인' 버튼에 onConfirm 콜백 연결
                    style: "destructive", // 위험한 작업임을 알리는 스타일 유지
                },
            ],
            { cancelable: false }
        );
    }
}
