import { useNavigate } from "react-router-dom";
import GameHeader from "@/components/game/common/GameHeader";

export default function MysteryCardsLobbyPage() {
    const navigate = useNavigate();
    const GAME_ID = 2;

    const handleLevelSelect = (level: string) => {
        // Query Parameter로 전달
        navigate(`/game/mysteryCards/play?gameId=${GAME_ID}&level=${level}`);
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#F0F9FF]">
            <GameHeader />

            <div className="flex-1 flex flex-col items-center justify-center pb-12 p-4">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-[#1E3A8A] mb-2">Mystery Cards 🃏</h1>
                    <p className="text-lg text-[#64748B]">Choose your level</p>
                </div>

                <div className="w-full max-w-sm flex flex-col gap-4">
                    {['FIRST', 'SECOND', 'THIRD'].map((level, index) => (
                        <button
                            key={level}
                            onClick={() => handleLevelSelect(level)}
                            className="w-full py-4 px-5 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                        >
                            <span className="text-white text-lg font-bold">Level {index + 1}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
