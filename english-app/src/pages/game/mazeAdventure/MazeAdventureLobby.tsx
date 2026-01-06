import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoHelpCircle } from "react-icons/io5";
import GameHeader from "@/components/game/common/GameHeader";
import MazeHelpModal from "@/components/game/mazeAdventure/MazeHelpModal";

const LEVELS = ['FIRST', 'SECOND', 'THIRD'];
const GAME_ID = 3;

export default function MazeAdventureLobbyPage() {
    const navigate = useNavigate();
    const [isHelpModalVisible, setIsHelpModalVisible] = useState(false);

    const handleLevelSelect = (level: string) => {
        // Query Parameter로 전달
        navigate(`/game/mazeAdventure/play?gameId=${GAME_ID}&level=${level}`);
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#E0F2FE]">
            <GameHeader />

            <div className="flex-1 flex flex-col items-center justify-center pb-12 p-4">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-[#075985] mb-2">Maze Adventure 🚧</h1>
                    <p className="text-lg text-[#475569]">Navigate & Command</p>
                </div>

                <div className="w-full max-w-sm flex flex-col gap-4">
                    {LEVELS.map((level, index) => (
                        <button
                            key={level}
                            onClick={() => handleLevelSelect(level)}
                            className={`
                                w-full py-4 px-5 rounded-xl shadow-md transition-transform hover:-translate-y-1 active:scale-95
                                ${index === 2 
                                    ? 'bg-red-500 hover:bg-red-600 shadow-red-200' 
                                    : 'bg-[#0EA5E9] hover:bg-[#0284C7] shadow-sky-200'
                                }
                            `}
                        >
                            <span className="text-white text-lg font-bold">
                                {index === 0 && "Level 1 (Easy)"}
                                {index === 1 && "Level 2 (Normal)"}
                                {index === 2 && "Level 3 (Hard)"}
                            </span>
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => setIsHelpModalVisible(true)}
                    className="mt-10 flex items-center gap-2 px-4 py-2 rounded-full border border-[#0EA5E9] bg-[#0EA5E9]/10 hover:bg-[#0EA5E9]/20 transition-colors"
                >
                    <IoHelpCircle size={20} className="text-[#0EA5E9]" />
                    <span className="text-[#0EA5E9] font-semibold">Guide</span>
                </button>
            </div>

            <MazeHelpModal 
                visible={isHelpModalVisible}
                onClose={() => setIsHelpModalVisible(false)}
            />
        </div>
    );
}
