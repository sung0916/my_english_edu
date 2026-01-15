import React, { useEffect, useState } from 'react';

const SplashScreen = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isFading, setIsFading] = useState(false);

    useEffect(() => {
        // Check if splash screen has already been shown in this session
        const hasShownSplash = sessionStorage.getItem('splash_shown');

        if (!hasShownSplash) {
            setIsVisible(true);

            // Mark as shown so it doesn't appear again on refresh or internal navigation
            sessionStorage.setItem('splash_shown', 'true');

            // Start fade out after initial delay
            const fadeTimer = setTimeout(() => {
                setIsFading(true);
            }, 1000); // Show fully for 1 second

            // Remove from DOM after transition completes
            const removeTimer = setTimeout(() => {
                setIsVisible(false);
            }, 3000); // 1s delay + 1.5s transition

            return () => {
                clearTimeout(fadeTimer);
                clearTimeout(removeTimer);
            };
        }
    }, []);

    if (!isVisible) return null;

    return (
        <div
            className={`fixed inset-0 z-50 overflow-hidden bg-white transition-opacity duration-[2000ms] ease-in-out ${
                isFading ? 'opacity-0' : 'opacity-100'
            }`}
        >
            {/* 1. 뒷배경: 흐릿하게 확대된 이미지 */}
            <div 
                className="absolute inset-0 z-0 w-full h-full bg-cover bg-center blur-2xl scale-110 opacity-60"
                style={{ backgroundImage: "url('/splashscreen.png')" }}
            />
            
            {/* 배경을 좀 더 어둡거나 밝게 눌러주는 오버레이 (선택사항) */}
            <div className="absolute inset-0 z-0 bg-white/30" /> 

            {/* 2. 앞쪽: 원본 비율 유지 (Contain) */}
            <div className="relative z-10 w-full h-full flex items-center justify-center">
                <img
                    src="/splashscreen.png"
                    alt="Splash Screen"
                    className="max-w-full max-h-full object-contain shadow-2xl"
                />
            </div>
        </div>
    );
};

export default SplashScreen;
