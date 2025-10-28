import { StyleSheet, Text, View } from "react-native";

export default function HomePage() {
    // const {width} = useWindowDimensions(); 현재 화면의 가로, 세로 길이를 가져온다.

    return (
    // 최상위 View는 화면 전체를 차지합니다.
    <View style={styles.container}>
      {/* 1. 배너 공간 */}
      <View style={styles.bannerContainer}>
        <Text style={styles.placeholderText}>배너 공간 (Banner Area)</Text>
      </View>

      {/* 2. 컨텐츠 공간 */}
      <View style={styles.contentContainer}>
        <Text style={styles.placeholderText}>컨텐츠 공간 (Content Area)</Text>
      </View>
    </View>
  );
}

// CSS 파일 대신 StyleSheet.create()를 사용해 스타일을 정의한다.
const styles = StyleSheet.create({
  container: {
    flex: 1, // 화면 전체를 차지하도록 설정 (필수)
    backgroundColor: '#fff',
  },
  // 상단 배너 영역 스타일
  bannerContainer: {
    flex: 1, // container의 전체 공간 중 1의 비율을 차지
    backgroundColor: '#d7eef9', // 임시 배경색 (하늘색 계열)
    justifyContent: 'center', // 내부 텍스트를 세로 중앙에 배치
    alignItems: 'center',     // 내부 텍스트를 가로 중앙에 배치
    borderBottomWidth: 1,     // 하단에 경계선 추가
    borderBottomColor: '#ccc',
  },
  // 하단 컨텐츠 영역 스타일
  contentContainer: {
    flex: 3, // container의 전체 공간 중 3의 비율을 차지 (배너보다 3배 크게)
    backgroundColor: '#f5f5f5', // 임시 배경색 (회색 계열)
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20, // 내부 여백
  },
  // 임시 텍스트 스타일
  placeholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#888',
  },
});