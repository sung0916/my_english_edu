import React from 'react';

// 웹 표준 HTML 버튼 속성을 상속받으면서, 기존 RN에서 쓰던 title과 onPress를 지원하도록 정의
interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  title: string;
  onPress?: () => void; // RN의 onPress를 웹의 onClick으로 매핑하기 위해 추가
}

const PermitCustomButton = ({ title, onPress, onClick, className = '', style, ...props }: CustomButtonProps) => {
  return (
    <button
      // RN의 onPress가 들어오면 onClick으로 실행, 원래 onClick이 있다면 그것도 실행
      onClick={onClick || onPress}
      
      // Tailwind CSS 클래스 적용
      className={`
        bg-[#7ebdff] 
        text-white text-base font-bold
        py-3 px-6 
        rounded-lg
        shadow-md
        flex items-center justify-center
        transition-all duration-200 ease-in-out
        hover:bg-[#5c9ce6] 
        hover:scale-[1.01]
        active:scale-95
        ${className} 
      `}
      style={style}
      {...props}
    >
      {title}
    </button>
  );
};

export default PermitCustomButton;
