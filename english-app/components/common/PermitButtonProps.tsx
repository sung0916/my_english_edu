import React, { useState } from 'react';
import { Pressable, PressableProps, StyleSheet, Text } from 'react-native';

interface CustomButtonProps extends PressableProps {
  title: string;
}

const PermitCustomButton = ({ title, onPress, style, ...props }: CustomButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Pressable
      onHoverIn={() => setIsHovered(true)} 
      onHoverOut={() => setIsHovered(false)} 
      
      style={(pressableState) => {
        const externalStyle = typeof style === 'function'
          ? style(pressableState) 
          : style;             
        
        return [
          styles.button,                     
          isHovered && styles.hoveredButton,  
          externalStyle,                      
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
    transitionDuration: '0.2s', 
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  hoveredButton: {
    backgroundColor: '#5c9ce6',
    transform: [{ scale: 1.01 }], 
  },
});

export default PermitCustomButton;
