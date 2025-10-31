import React, { useState } from 'react';
import { Pressable, PressableProps, StyleProp, StyleSheet, Text, TextStyle, ViewStyle } from 'react-native';

interface CustomButtonProps extends PressableProps {
  title: string;
}

const RefuseCustomButton = ({ title, onPress, style, ...props }: CustomButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Pressable
      onHoverIn={() => setIsHovered(true)} 
      onHoverOut={() => setIsHovered(false)} 

      // Pressable의 style prop을 배열이 아닌 '함수' 형태로 사용합니다.
      // 이 함수는 pressableState 객체(pressed, hovered 등의 상태 포함)를 인자로 받습니다.
      style={(pressableState) => {
        // 부모로부터 받은 style prop이 함수인지 확인
        const externalStyle = typeof style === 'function'
          ? style(pressableState) // style이 함수라면 실행
          : style;              // style이 객체라면 그대로 사용
        
        // 모든 스타일 객체를 하나의 배열에 담아 반환
        return [
          styles.button,                      // 기본 버튼 스타일
          isHovered && styles.hoveredButton,  // Hover 상태일 때의 조건부 스타일
          externalStyle,                      // 부모로부터 받은 스타일
        ];
      }}

      onPress={onPress}
      {...props}
    >
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#fc8d8dff',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    transitionDuration: '0.2s', // 부드러운 전환 효과 (웹 전용)
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  hoveredButton: {
    backgroundColor: '#f75b63ff', 
    transform: [{ scale: 1.01 }], 
  },
});

export default RefuseCustomButton;