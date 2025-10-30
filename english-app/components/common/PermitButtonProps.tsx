import React, { useState } from 'react';
import { Pressable, PressableProps, StyleProp, StyleSheet, Text, TextStyle, ViewStyle } from 'react-native';

interface CustomButtonProps extends PressableProps {
  title: string;
}

const PermitCustomButton = ({ title, onPress, ...props }: CustomButtonProps) => {
  // 1. 마우스가 위에 있는지 여부를 저장할 state를 만듭니다. (기본값: false)
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Pressable
      // 2. onHoverIn/onHoverOut 이벤트를 사용하여 isHovered 상태를 변경합니다.
      onHoverIn={() => setIsHovered(true)} // 마우스가 컴포넌트 안으로 들어오면 true
      onHoverOut={() => setIsHovered(false)} // 마우스가 컴포넌트 밖으로 나가면 false
      
      // 3. style을 배열로 전달하여 isHovered 상태에 따라 조건부 스타일을 적용합니다.
      style={[
        styles.button,
        isHovered && styles.hoveredButton // isHovered가 true일 때만 hoveredButton 스타일 적용
      ]}
      onPress={onPress}
      {...props}
    >
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    //width: 150,
    backgroundColor: '#7ebdffff',
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
  // 4. Hover 상태일 때 적용될 새로운 스타일을 정의합니다.
  hoveredButton: {
    backgroundColor: '#5c9ce6', // 살짝 더 어두운 파란색
    transform: [{ scale: 1.01 }], // 살짝 커지는 효과
  },
});

export default PermitCustomButton;