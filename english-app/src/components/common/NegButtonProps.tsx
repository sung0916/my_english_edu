import React from 'react';

interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  title: string;
  onPress?: () => void;
}

const RefuseCustomButton = ({ title, onPress, onClick, className = '', style, ...props }: CustomButtonProps) => {
  return (
    <button
      onClick={onClick || onPress}
      
      className={`
        bg-[#fc8d8d] 
        text-white text-base font-bold
        py-3 px-6 
        rounded-lg
        shadow-md
        flex items-center justify-center
        transition-all duration-200 ease-in-out
        hover:bg-[#f75b63] 
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

export default RefuseCustomButton;
