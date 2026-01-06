import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { IoCloseCircle } from "react-icons/io5";
import EduHeader from "@/components/english/EduHeader"; // 마이그레이션된 EduHeader 사용

// 1. 데이터 인터페이스
interface PlaceObject {
    id: number;
    word: string;
    meaning: string;
    position: { top: number; left: number; width: number; height: number; }
}

interface PlaceData {
    id: number;
    name: string;
    bgImage: string; 
    objects: PlaceObject[];
}

// 2. 개발용 가짜 데이터
const MOCK_DB: Record<string, PlaceData> = {
    "1": {
        id: 1,
        name: "classroom",
        bgImage: "https://img.freepik.com/free-vector/kitchen-interior-design-with-furniture-decoration_1308-62040.jpg",
        objects: [
            {
                id: 101,
                word: "Refrigerator",
                meaning: "냉장고",
                position: { top: 20, left: 5, width: 18, height: 45 }
            },
            {
                id: 102,
                word: "kitchen",
                meaning: "부엌",
                position: { top: 60, left: 30, width: 25, height: 25 }
            },
            {
                id: 103,
                word: "supermarket",
                meaning: "수퍼마켓",
                position: { top: 25, left: 65, width: 15, height: 20 }
            },
        ]
    }
};

export default function EnglishDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const placeName = searchParams.get('placeName');
    const navigate = useNavigate();
    
    const title = placeName || `Place #${id}`;

    // 상태 관리
    const [placeData, setPlaceData] = useState<PlaceData | null>(null);
    const [selectedObjectId, setSelectedObjectId] = useState<number | null>(null);
    const [isGameModalVisible, setGameModalVisible] = useState(false);
    const isAtLobby = !isGameModalVisible;

    // 데이터 로드
    useEffect(() => {
        const targetId = id || '1';
        const data = MOCK_DB[targetId] || MOCK_DB["1"];
        setPlaceData(data);
    }, [id]);

    // TTS 읽기 (Web Speech API)
    const playSound = (text: string) => {
        window.speechSynthesis.cancel(); // 기존 음성 중단
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
    };

    // 객체 클릭 핸들러
    const handleObjectClick = (obj: PlaceObject, e: React.MouseEvent) => {
        e.stopPropagation(); // 배경 클릭 방지

        if (selectedObjectId === obj.id) {
            console.log(`Double Clicked! Move to detail of ${obj.word}`);
            // alert(`Go to ${obj.word} World! 🚀`); 
        } else {
            setSelectedObjectId(obj.id);
            playSound(obj.word);
        }
    };

    // 배경 클릭 시 선택 해제
    const handleBackgroundClick = () => {
        setSelectedObjectId(null);
    };

    const handleBackToLobby = () => {
        if (isGameModalVisible) {
            setGameModalVisible(false);
        } else {
            navigate(-1);
        }
    };

    if (!placeData) return <div className="flex h-screen items-center justify-center">Loading...</div>;

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            {/* 공통 헤더 */}
            <EduHeader title={title} isAtLobby={isAtLobby} onHomeClick={handleBackToLobby} />

            <div className="flex flex-1 relative overflow-hidden">
                
                {/* 배경 및 핫스팟 영역 */}
                <div 
                    className="flex-1 relative bg-cover bg-center cursor-pointer"
                    style={{ backgroundImage: `url(${placeData.bgImage})` }}
                    onClick={handleBackgroundClick}
                >
                    {placeData.objects.map((obj) => (
                        <div
                            key={obj.id}
                            className={`absolute cursor-pointer transition-all duration-200
                                ${selectedObjectId === obj.id 
                                    ? 'border-4 border-white bg-white/20 shadow-[0_0_15px_rgba(255,255,255,0.5)]' 
                                    : 'border-0 bg-transparent hover:bg-white/10'
                                }
                            `}
                            style={{
                                top: `${obj.position.top}%`,
                                left: `${obj.position.left}%`,
                                width: `${obj.position.width}%`,
                                height: `${obj.position.height}%`,
                                borderRadius: '15px'
                            }}
                            onClick={(e) => handleObjectClick(obj, e)}
                        >
                            {/* 이름표 */}
                            {selectedObjectId === obj.id && (
                                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-lg font-bold text-sm whitespace-nowrap z-10">
                                    {obj.word}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* 🚀 우측 로켓 사이드바 */}
                <div className="w-[120px] bg-[#2C3E50] border-l-4 border-[#34495E] flex flex-col items-center py-6 z-20 shadow-xl">
                    <div className="flex flex-col w-full h-full items-center justify-center gap-4">
                        <h2 className="text-white text-lg font-bold mb-2">Menu</h2>

                        {['Activity 1', 'Activity 2', 'Activity 3'].map((act, idx) => (
                            <button
                                key={idx}
                                className="w-4/5 py-2 bg-[#4ECDC4] text-white font-bold text-xs rounded-full border-2 border-white hover:bg-[#3dbdb4] transition-colors shadow-md active:scale-95"
                                onClick={() => setGameModalVisible(true)}
                            >
                                {act}
                            </button>
                        ))}

                        <div className="h-[2px] w-4/5 bg-white/30 my-2" />

                        <button 
                            className="w-4/5 py-2 bg-[#FF6B6B] text-white font-bold text-xs rounded-full border-2 border-white hover:bg-[#ff5252] transition-colors shadow-md active:scale-95"
                            onClick={() => window.confirm('Do you want to quit?') && navigate(-1)}
                        >
                            Quit
                        </button>
                    </div>
                </div>

                {/* 🎮 게임 선택 모달 (Overlay) */}
                {isGameModalVisible && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
                        <div className="bg-white w-[400px] h-[300px] rounded-2xl flex flex-col items-center justify-center border-[5px] border-[#FFD93D] shadow-2xl relative animate-fadeIn">
                            <h2 className="text-2xl font-bold text-gray-800 mb-8">Choose the Level</h2>
                            
                            <div className="flex gap-5">
                                <button 
                                    className="px-8 py-4 bg-[#6C5CE7] text-white text-lg font-bold rounded-xl hover:bg-[#5b4cc4] transition-colors shadow-lg active:scale-95"
                                    onClick={() => alert('Start Level 1')}
                                >
                                    Level 1
                                </button>
                                <button 
                                    className="px-8 py-4 bg-[#6C5CE7] text-white text-lg font-bold rounded-xl hover:bg-[#5b4cc4] transition-colors shadow-lg active:scale-95"
                                    onClick={() => alert('Start Level 2')}
                                >
                                    Level 2
                                </button>
                            </div>

                            <button
                                className="absolute top-3 right-3 text-[#FF6B6B] hover:text-[#ff5252] transition-colors"
                                onClick={() => setGameModalVisible(false)}
                            >
                                <IoCloseCircle size={40} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
