import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
    IoHome, 
    IoMic, 
    IoStopCircle, 
    IoVolumeHigh, 
    IoVolumeMute, 
    IoExpand, 
    IoContract, 
    IoClose 
} from "react-icons/io5";
import { crossPlatformConfirm, crossPlatformAlert } from "@/utils/crossPlatformAlert";

interface EduHeaderProps {
    title: string; // 장소 이름 (예: Kitchen)
    isAtLobby?: boolean;
    onHomeClick?: () => void;
}

export default function EduHeader({ title, isAtLobby, onHomeClick }: EduHeaderProps) {
    const navigate = useNavigate();

    // 상태 관리
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isRecording, setIsRecording] = useState(false);

    // 1. 홈으로 가기 (나가기)
    const handleExit = () => {
        crossPlatformConfirm(
            '',
            'Are you sure you want to leave?',
            () => {
                // 웹 보안 정책상 스크립트로 열지 않은 창은 window.close()가 막힐 수 있음
                // 1차 시도: 창 닫기, 실패 시: 뒤로 가기
                try {
                    window.close();
                } catch (e) {
                    console.warn("Cannot close window, navigating back.");
                    navigate(-1); 
                }
            }
        );
    };

    const handleHomePress = () => {
        if (onHomeClick) {
            onHomeClick();
        }
    };

    // 2. 전체화면 토글 (Web Standard API)
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    // 3. 음소거 토글
    const toggleMute = () => {
        setIsMuted(!isMuted);
        console.log("Mute toggled:", !isMuted); 
    };

    // 4. 녹음 토글 (UI만 구현)
    const handleRecordPress = () => {
        if (isRecording) {
            setIsRecording(false);
            // crossPlatformAlert("", "Recording Stopped");
        } else {
            setIsRecording(true);
            // crossPlatformAlert("", "Recording Started");
        }
    };

    // 공통 버튼 스타일 (Tailwind)
    const iconBtnClass = "p-2 ml-1 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer";

    return (
        <header className="h-[60px] flex flex-row justify-between items-center px-4 bg-white border-b border-gray-100 shadow-sm z-50 sticky top-0">
            {/* 왼쪽: 타이틀 & 홈 버튼 */}
            <div className="flex flex-row items-center gap-3">
                <button 
                    onClick={handleHomePress} 
                    className={`${iconBtnClass} ${isAtLobby ? 'opacity-30 cursor-not-allowed' : ''}`} 
                    disabled={isAtLobby}
                >
                    <IoHome size={24} color="#333" />
                </button>
                <h1 className="text-lg font-bold text-gray-800">{title}</h1>
            </div>

            {/* 오른쪽: 기능 버튼들 */}
            <div className="flex flex-row items-center">
                
                {/* 녹음 버튼 */}
                <button onClick={handleRecordPress} className={iconBtnClass}>
                    {isRecording ? (
                        <div className="flex flex-row items-center bg-red-50 px-3 py-1 rounded-full">
                            <IoStopCircle size={24} color="#E74C3C" />
                            <span className="text-[#E74C3C] text-xs font-bold ml-1">REC</span>
                        </div>
                    ) : (
                        <IoMic size={24} color="#333" />
                    )}
                </button>

                {/* 음소거 버튼 */}
                <button onClick={toggleMute} className={iconBtnClass}>
                    {isMuted ? (
                        <IoVolumeMute size={24} color="#95A5A6" />
                    ) : (
                        <IoVolumeHigh size={24} color="#333" />
                    )}
                </button>

                {/* 전체화면 버튼 */}
                <button onClick={toggleFullscreen} className={iconBtnClass}>
                    {isFullscreen ? (
                        <IoContract size={24} color="#333" />
                    ) : (
                        <IoExpand size={24} color="#333" />
                    )}
                </button>

                {/* 나가기 버튼 (빨간색) */}
                <button 
                    onClick={handleExit} 
                    className="ml-3 p-1.5 bg-red-50 rounded-full hover:bg-red-100 transition-colors flex items-center justify-center"
                >
                    <IoClose size={22} color="#C0392B" />
                </button>
            </div>
        </header>
    );
}
