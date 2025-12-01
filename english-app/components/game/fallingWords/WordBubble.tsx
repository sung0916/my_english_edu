import { StyleSheet, Text, View } from "react-native";

interface WordBubbleProps {
    text: string;
    x: number;
    y: number;
    color?: string;
}

export default function WordBubble({text, x, y, color = '#3498DB'}: WordBubbleProps) {

    return (
        <View style={[styles.bubble, {left: x, top: y, backgroundColor: color}]}>
            <Text style={styles.text}>{text}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    bubble: {
    position: 'absolute',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4, // 안드로이드 그림자
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
