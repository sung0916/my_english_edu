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
            {/* 헤더 애니메이션: fade-in-down (tailwind config 필요 혹은 style 직접 사용) */}
            <div className="text-center py-10 animate-fade-in-down">
                <h1 className="text-3xl md:text-4xl font-extrabold text-[#2C3E50] mb-2">Where to go?</h1>
                <p className="text-[#7F8C8D]">Select a place for traveling!</p>
            </div>

            {isLoading ? (
                <div className="text-center mt-20">Loading...</div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4 max-w-[1800px] mx-auto">
                    {places.map((item, index) => {
                        const accentColor = colors[index % colors.length];
                        return (
                            <div 
                                key={item.id}
                                onClick={() => handlePlaceClick(item.id, item.placeName)}
                                className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center border-2 border-transparent shadow-sm hover:shadow-lg hover:scale-105 hover:z-10 transition-all duration-300 cursor-pointer aspect-[1.25]"
                                style={{ borderColor: accentColor }}
                            >
                                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: accentColor }}>
                                    {item.id}
                                </div>
                                <IoLocationSharp size={32} color={accentColor} className="mb-2 opacity-80" />
                                <h3 className="text-sm md:text-base font-bold text-[#34495E] text-center break-words line-clamp-2">
                                    {formatName(item.placeName)}
                                </h3>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default EnglishPage;
