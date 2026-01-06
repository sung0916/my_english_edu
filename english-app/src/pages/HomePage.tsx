import React, { useEffect, useState } from 'react';
import Footer from "@/components/common/Footer";

export default function HomePage() {
  const [isFooterVisible, setIsFooterVisible] = useState(false);

  // 스크롤 이벤트 핸들러
  useEffect(() => {
    const handleScroll = () => {
      // 1. 현재 스크롤 위치 + 화면 높이
      const scrollPosition = window.scrollY + window.innerHeight;
      // 2. 전체 문서 높이
      const documentHeight = document.documentElement.scrollHeight;
      
      // 3. 바닥 감지 (오차범위 10px 정도 둠)
      const isAtBottom = scrollPosition >= documentHeight - 10;

      if (isAtBottom !== isFooterVisible) {
        setIsFooterVisible(isAtBottom);
      }
    };

    // 윈도우 스크롤 이벤트 등록
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isFooterVisible]);

  return (
    <div className="relative min-h-screen bg-white">
      {/* 
        웹에서는 ScrollView 대신 브라우저 기본 스크롤을 사용하므로 
        별도의 ScrollWrapper 없이 div로 내용을 배치합니다.
      */}
      
      {/* 배너 영역 */}
      <div className="min-h-[300px] bg-[#d7eef9] flex justify-center items-center border-b border-gray-300">
        <span className="text-2xl font-bold text-gray-500">
          배너 공간 (Banner Area)
        </span>
      </div>

      {/* 컨텐츠 영역 */}
      <div className="min-h-[600px] bg-[#f5f5f5] flex flex-col justify-center items-center p-5">
        <span className="text-2xl font-bold text-gray-500 mb-10">
          컨텐츠 공간 (Content Area)
        </span>
        
        {/* 스크롤 테스트용 공간 */}
        <div className="h-[800px] w-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400">
          Scroll Down Test Area
        </div>
      </div>

      {/* 
        [푸터 Wrapper]
        absolute, bottom-0으로 화면 하단에 고정하되,
        opacity로 부드럽게 나타나게 처리
      */}
      <div 
        className={`
          absolute bottom-0 left-0 right-0 
          transition-opacity duration-300 ease-in-out
          ${isFooterVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
      >
        <Footer />
      </div>
    </div>
  );
}
