import React from 'react';

interface WordBubbleProps {
    text: string;
    meaning: string;
    x: number;
    y: number;
    isMatched: boolean;
}

export default function WordBubble({ text, meaning, x, y, isMatched }: WordBubbleProps) {
    const displayText = isMatched ? meaning : text;

    return (
        <div
            className={`
                absolute 
                flex items-center justify-center 
                px-4 py-2 
                rounded-full border-2 
                shadow-md
                transition-transform duration-200
                ${isMatched 
                    ? 'bg-gray-200/80 border-gray-400 scale-110' 
                    : 'bg-[#3498DB] border-white'
                }
            `}
            style={{
                left: x,
                top: y,
                // 하드웨어 가속을 사용하여 움직임 최적화 (선택사항)
                willChange: 'top, left',
            }}
        >
            <span
                className={`
                    font-bold text-lg
                    ${isMatched ? 'text-gray-800' : 'text-white'}
                `}
            >
                {displayText}
            </span>
        </div>
    );
}
