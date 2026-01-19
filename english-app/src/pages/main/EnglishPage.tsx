import React, { useCallback, useEffect, useState } from "react";
import { IoLocationSharp } from "react-icons/io5";
import apiClient from "@/api";
import { crossPlatformAlert } from "@/utils/crossPlatformAlert";

interface Place {
    id: number;
    placeName: string;
    description?: string;
}

const EnglishPage = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [places, setPlaces] = useState<Place[]>([]);
    
    // 1. 카테고리 상태 (이제 "All", "G1", "G2" 등의 label 값을 저장)
    const [activeCategory, setActiveCategory] = useState("All");

    // 2. 카테고리 정의 (Label과 실제 ID 범위를 매핑)
    const categories = [
        { label: "All", min: 0, max: 9999 }, // 전체
        { label: "G1", min: 1, max: 10 },
        { label: "G2", min: 11, max: 20 },
        { label: "G3", min: 21, max: 30 },
        { label: "G4", min: 31, max: 40 },
        { label: "G5", min: 41, max: 50 },
        { label: "G6", min: 51, max: 60 },
    ];

    // 색상 패턴
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'];

    const fetchPlaces = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await apiClient.get<Place[]>('/api/places/getPlaces');
            setPlaces(response.data);
        } catch (error) {
            console.error(error);
            crossPlatformAlert('Error', '데이터 로드 실패');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchPlaces(); }, [fetchPlaces]);

    // 3. 필터링 로직 변경 (문자열 파싱 -> 객체 참조)
    const filteredPlaces = places.filter((place) => {
        if (activeCategory === "All") return true;
        
        // 현재 선택된 카테고리의 범위 정보를 찾음
        const currentCategory = categories.find(c => c.label === activeCategory);
        
        // 만약 카테고리 정보가 있다면 해당 범위 내인지 확인
        if (currentCategory) {
            return place.id >= currentCategory.min && place.id <= currentCategory.max;
        }
        return true;
    });

    const handlePlaceClick = (id: number, name: string) => {
        const width = 1200;
        const height = 900;
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;
        const url = `${window.location.origin}/english/${id}?placeName=${encodeURIComponent(name)}`;
        
        window.open(url, `place_popup_${id}`, `width=${width}, height=${height}, top=${top}, left=${left}, resizable=yes`);
    };

    const formatName = (name: string) => name ? name.charAt(0).toUpperCase() + name.slice(1).toLowerCase().replace(/_/g, " ") : "";

    return (
        <div className="min-h-screen bg-[#F7F9FC] p-5 pb-20">
            {/* 헤더 */}
            <div className="text-center py-10 animate-fade-in-down">
                <h1 className="text-3xl md:text-4xl font-extrabold text-[#2C3E50] mb-2">Where to go?</h1>
                <p className="text-[#7F8C8D]">Select a place for traveling!</p>
            </div>

            {/* 4. 카테고리 버튼 UI 수정 */}
            <div className="flex flex-wrap justify-center gap-3 mb-8 max-w-4xl mx-auto">
                {categories.map((cat) => (
                    <button
                        key={cat.label} // key는 고유한 label 사용
                        onClick={() => setActiveCategory(cat.label)}
                        className={`
                            px-4 py-2 rounded-full text-sm font-bold transition-all duration-300
                            ${activeCategory === cat.label 
                                ? "bg-[#2C3E50] text-white shadow-md scale-105" // 활성 상태
                                : "bg-white text-[#7F8C8D] hover:bg-gray-100 border border-gray-200" // 비활성 상태
                            }
                        `}
                    >
                        {/* 보여지는 텍스트는 cat.label (All, G1, G2...) */}
                        {cat.label} 
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="text-center mt-20 text-[#7F8C8D]">Loading...</div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4 max-w-[1800px] mx-auto">
                    {/* 5. filteredPlaces 렌더링 (기존 로직 유지) */}
                    {filteredPlaces.length > 0 ? (
                        filteredPlaces.map((item) => {
                            const accentColor = colors[item.id % colors.length]; 
                            return (
                                <div 
                                    key={item.id}
                                    onClick={() => handlePlaceClick(item.id, item.placeName)}
                                    className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center border-2 border-transparent shadow-sm hover:shadow-lg hover:scale-105 hover:z-10 transition-all duration-300 cursor-pointer aspect-[1.25]"
                                    style={{ borderColor: accentColor }}
                                >
                                    {/* <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: accentColor }}>
                                        {item.id}
                                    </div> */}
                                    <IoLocationSharp size={32} color={accentColor} className="mb-2 opacity-80" />
                                    <h3 className="text-sm md:text-base font-bold text-[#34495E] text-center break-words line-clamp-2">
                                        {formatName(item.placeName)}
                                    </h3>
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-full text-center py-20 text-gray-400">
                            Places are not ready
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default EnglishPage;
