import React from 'react';

interface Props {
    radius?: number;  // 밝은 영역의 반지름 (px)
}

export default function FlashlightOverlay({ radius = 150 }: Props) {
    return (
        <div 
            className="absolute inset-0 z-20 pointer-events-none"
            style={{
                background: `radial-gradient(circle ${radius}px at 50% 50%, transparent 0%, rgba(0,0,0,0.8) 80%, black 100%)`
            }}
        >
            {/* 
                radial-gradient: 원형 그라데이션
                circle ${radius}px: 중심부 밝은 원의 크기
                at 50% 50%: 화면 중앙 기준 (플레이어 위치에 따라 이동하려면 이 값을 props로 받아야 함)
                transparent 0%: 중심은 투명 (보임)
                rgba(0,0,0,0.8): 점점 어두워짐
                black 100%: 나머지는 완전 검정 (안 보임)
            */}
        </div>
    );
}
