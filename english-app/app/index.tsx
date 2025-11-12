import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import Footer from "../components/common/Footer";

export default function HomePage() {
  
  const [isFooterVisible, setIsFooterVisible] = useState(false);

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isAtBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 1;

    if (isAtBottom !== isFooterVisible) {
      setIsFooterVisible(isAtBottom);
    }
  };
  
  return (
    // [핵심] 최상위 View는 이제 푸터를 포함할 '기준점'이 됩니다.
    <View style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.bannerContainer}>
          <Text style={styles.placeholderText}>배너 공간 (Banner Area)</Text>
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.placeholderText}>컨텐츠 공간 (Content Area)</Text>
          {/* 스크롤 테스트용 임시 뷰 */}
          <View style={{ height: 800 }} /> 
        </View>
      </ScrollView>

      {/* 
        [수정] isFooterVisible 상태에 따라 스타일을 동적으로 변경합니다.
        이제 Footer는 항상 렌더링되지만, 투명도와 위치가 조절됩니다.
      */}
      <View style={[styles.footerWrapper, { opacity: isFooterVisible ? 1 : 0 }]}>
        <Footer />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    // position: 'relative'와 같은 역할. 자식의 absolute 위치 기준점이 됨.
  },
  bannerContainer: {
    minHeight: 300, 
    backgroundColor: '#d7eef9',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  contentContainer: {
    minHeight: 600,
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#888',
  },
  // --- [추가] 푸터를 감싸는 Wrapper 스타일 ---
  footerWrapper: {
    position: 'absolute', // [핵심] 절대 위치 지정
    bottom: 0,            // 화면 맨 아래에 고정
    left: 0,
    right: 0,
    ...(Platform.OS === 'web' && {
      // '...' 스프레드 연산자를 사용하여 웹일 경우에만 아래 객체를 여기에 추가
      transition: 'opacity 0.3s ease-in-out', // 부드러운 전환
    }),
  },
});
