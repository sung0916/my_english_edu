import { StyleSheet, Text, View } from "react-native";

interface WordBubbleProps {
    text: string;
    meaning: string;
    x: number;
    y: number;
    isMatched: boolean;
}

export default function WordBubble({text, meaning, x, y, isMatched}: WordBubbleProps) {
    const displayText = isMatched ? meaning : text;  // 정답을 맞추면 한글, 아니면 영어 설정
    const bubbleStyle = isMatched  // 정답 시 스타일
        ? styles.matchedBubble
        : styles.defaultBubble;
    const textStyle = isMatched  // 정답 시 스타일
        ? styles.matchedText
        : styles.defaultText;
    

    return (
        <View style={[styles.baseBubble, bubbleStyle, {left: x, top: y}]}>
            <Text style={textStyle}>{displayText}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    baseBubble: {
    position: 'absolute',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 2,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // 기본 상태 (떨어지는 중)
  defaultBubble: {
    backgroundColor: '#3498DB', // 진한 파랑
    borderColor: '#fff',
  },
  defaultText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  // 정답 맞춘 상태 (효과)
  matchedBubble: {
    backgroundColor: 'rgba(189, 195, 199, 0.8)', // 연한 회색 (Opacity 적용)
    borderColor: '#7F8C8D',
    transform: [{ scale: 1.1 }], // 살짝 커짐
  },
  matchedText: {
    color: '#2C3E50', // 진한 회색 텍스트
    fontWeight: 'bold',
    fontSize: 18,
  },
});
