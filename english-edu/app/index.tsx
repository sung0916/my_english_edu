import { StyleSheet, Text, useWindowDimensions, View } from "react-native";

export default function HomePage() {
    const {width} = useWindowDimensions();  // 현재 화면의 가로, 세로 길이를 가져온다.

    return (
        // <div> 대신 <View> 사용. 레이아웃의 기본 단위.
        <View style={styles.container}>
            {/* <p>나 <span> 대신 <Text> 사용. 모든 텍스트를 이 안에서 사용.
                화면 너비 768px을 기준으로 웹/모바일 버전 텍스트 변경 
                <Text style={styles.title}>Monster English</Text> */}
            
            <Text style={[styles.title, {fontSize: width > 768 ? 48 :32}]}>
                {width > 768 ? 'Monster English(웹 사용 중)' : 'Monster English(모바일 사용 중)'}
            </Text>

            <Text style={styles.subtitle}>Let's get started Learning!!</Text>
        </View>
    );
}

// CSS 파일 대신 StyleSheet.create()를 사용해 스타일을 정의한다.
const styles = StyleSheet.create({
    container: {
        flex: 1, // 화면 전체를 차지하도록 설정 (매우 중요!)
        justifyContent: 'center', // 자식 요소들을 세로 방향 중앙에 배치
        alignItems: 'center',     // 자식 요소들을 가로 방향 중앙에 배치
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 32, // CSS 속성은 camelCase로 작성합니다.
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 18,
        color: 'gray',
        marginTop: 8,
    },
});