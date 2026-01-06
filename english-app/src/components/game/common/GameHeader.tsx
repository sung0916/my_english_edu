import { fetchUserRecords, GameRecordDto } from "@/api/gameApi";
import { useGameRecorder } from "@/hooks/game/useGameRecorder";
import { useGameStore } from "@/store/gameStore";
import { useUserStore } from "@/store/userStore";
import { crossPlatformConfirm } from "@/utils/crossPlatformAlert";
import { 
    IoHome, 
    IoPlayCircle, 
    IoPauseCircle, 
    IoContract, 
    IoExpand, 
    IoVolumeMute, 
    IoVolumeHigh, 
    IoMic, 
    IoStopCircle, 
    IoList, 
    IoClose 
} from "react-icons/io5"; 

import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import GameRecordsModal from "./GameRecords";
    
export default function GameHeader() {
    const navigate = useNavigate();
    const location = useLocation();  // usePathname 대체
    const isAtLobby = !location.pathname.includes('/play');

    // gameStore 상태 및 액션
    const { isMuted, toggleMute, isPaused, setIsPaused, resetGame } = useGameStore();
    const { user } = useUserStore();
    const [records, setRecords] = useState<GameRecordDto[]>([]);

    // 로컬 상태
    const [modalVisible, setModalVisible] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // 녹음 훅
    const { isRecording, startRecording, stopRecording } = useGameRecorder();

    useEffect(() => {
        if (modalVisible && user?.userId) {
            loadRecords();
        }
    }, [modalVisible]);

    const loadRecords = async () => {
        if (!user?.userId) return;
        try {
            const data = await fetchUserRecords(user.userId);
            const mappedData = data.map(r => ({
                ...r,
                gameName: getGameNameById(r.gameId)
            }));

            setRecords(mappedData);

        } catch (e) {
            console.error(e);
        }
    };

    const getGameNameById = (id: number) => {
        switch (id) {
            case 1: return 'Falling Words';
            case 2: return 'Mystery Cards';
            case 3: return 'Maze Adventure';
            case 4: return 'Crossword Puzzle';
            default: return `Game ${id}`;
        }
    };

    // 홈으로 가기
    const handleGoLobby = () => {
        setIsPaused(true);

        crossPlatformConfirm(
            'Move to lobby',
            'Your game will not be saved',
            () => {
                resetGame();
                // 정규식으로 마지막 세그먼트(/play 등) 제거
                const lobbyPath = location.pathname.replace(/\/[^/]+$/, '');

                if (lobbyPath && lobbyPath !== '/game') {
                    navigate(lobbyPath, { replace: true });
                } else {
                    navigate('/main/games', { replace: true });
                }
            },
            () => {
                setIsPaused(false);
            }
        )
    };

    // 일시정지
    const togglePause = () => {
        setIsPaused(!isPaused);
    };

    // 나가기 (창 닫기)
    const handleExit = () => {
        crossPlatformConfirm(
            '',
            'Do you want to quit this game?',
            () => {
                resetGame();
                // 웹에서는 window.close()가 보안상 사용자 스크립트로 열지 않은 창은 닫지 못할 수 있음.
                // 보통은 로비로 이동시키는게 안전함.
                try {
                    window.close();
                } catch (e) {
                    navigate('/main/games');
                }
            }
        );
    };

    // 전체화면 (웹 표준 API)
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    const handleRecordPress = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    }

    // 아이콘 버튼 스타일 공통화
    const iconBtnClass = "p-2 ml-1 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors";

    return (
        <>
            <header className="h-16 flex flex-row justify-between items-center px-4 bg-white border-b border-gray-100 shadow-sm z-10 sticky top-0">
                {/* 뒤로가기 | 나가기 */}
                <button
                    onClick={handleGoLobby}
                    className={`${iconBtnClass} ${isAtLobby ? 'opacity-30 cursor-not-allowed' : ''}`}
                    disabled={isAtLobby}
                >
                    <IoHome size={24} color="#333" />
                </button>

                {/* 기능 버튼 그룹 */}
                <div className="flex flex-row items-center">
                    {/* 일시정지 */}
                    <button onClick={togglePause} className={iconBtnClass}>
                        {isPaused ? 
                            <IoPlayCircle size={26} color="#2ECC71" /> : 
                            <IoPauseCircle size={26} color="#f39C12" />
                        }
                    </button>

                    {/* 전체화면 */}
                    <button onClick={toggleFullscreen} className={iconBtnClass}>
                        {isFullscreen ? 
                            <IoContract size={24} color="#333" /> : 
                            <IoExpand size={24} color="#333" />
                        }
                    </button>

                    {/* 음소거 */}
                    <button onClick={toggleMute} className={iconBtnClass}>
                        {isMuted ? 
                            <IoVolumeMute size={24} color="#333" /> : 
                            <IoVolumeHigh size={24} color="#333" />
                        }
                    </button>

                    {/* 녹음 */}
                    <button onClick={handleRecordPress} className={iconBtnClass}>
                        {isRecording ? (
                            <div className="flex flex-row items-center bg-red-50 px-2 py-1 rounded-full">
                                <IoStopCircle size={24} color="#E74C3C" />
                                <span className="text-[#E74C3C] text-xs font-bold ml-1">Rec</span>
                            </div>
                        ) : (
                            <IoMic size={24} color="#333" />
                        )}
                    </button>

                    {/* 기록 보기 */}
                    <button onClick={() => setModalVisible(true)} className={iconBtnClass}>
                        <IoList size={24} color="#3498DB" />
                    </button>

                    {/* 바로 나가기 (특별 스타일) */}
                    <button onClick={handleExit} className="ml-3 p-1 bg-red-50 rounded-full hover:bg-red-100 transition-colors">
                        <IoClose size={20} color="#C0392B" />
                    </button>
                </div>
            </header>

            {/* 기록 모달 연결 */}
            <GameRecordsModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                records={records}
            />
        </>
    );
}
