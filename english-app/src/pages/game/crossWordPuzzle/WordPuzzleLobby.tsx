import { useNavigate } from "react-router-dom";
import { useGameStore } from "@/store/gameStore";
import GameHeader from "@/components/game/common/GameHeader";

const LEVELS = [
    {id: '1', label: 'Level 1', desc: 'Easy', key: 'FIRST'},
    {id: '2', label: 'Level 2', desc: 'Normal', key: 'SECOND'},
    {id: '3', label: 'Level 3', desc: 'Hard', key: 'THIRD'},
    {id: '4', label: 'Level 4', desc: 'Expert', key: 'FOURTH'},
    {id: '5', label: 'Level 5', desc: 'Hell', key: 'FIFTH'},
];

export default function WordPuzzleLobbyPage() {
    const navigate = useNavigate();
    const { setLevel } = useGameStore();

    const handleStartGame = (levelId: string) => {
        setLevel(levelId);
        // 쿼리 스트링으로 레벨 전달
        navigate(`/game/crossWordPuzzle/play?level=${levelId}`);
    };

    return (
        <div className="flex flex-col h-full bg-[#F9EBEA] min-h-screen">
            <GameHeader />

            <div className="flex-1 flex flex-col items-center p-5 overflow-y-auto">
                <div className="text-center mb-8 mt-4">
                    <h1 className="text-4xl font-bold text-[#C0392B] mb-2">Crossword Puzzle</h1>
                    <p className="text-[#7F8C8D] text-lg">Choose a game level</p>
                </div>

                <div className="w-full max-w-[400px] flex flex-col gap-4 pb-10">
                    {LEVELS.map((lvl) => (
                        <button
                            key={lvl.id}
                            onClick={() => handleStartGame(lvl.id)}
                            className="flex items-center bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow active:scale-[0.98] duration-200 text-left"
                        >
                            <div className="w-12 h-12 rounded-full bg-[#E74C3C] flex justify-center items-center mr-4 shrink-0 shadow-sm">
                                <span className="text-white text-xl font-bold">{lvl.id}</span>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-[#333]">{lvl.label}</h3>
                                <p className="text-sm text-gray-500 mt-0.5">{lvl.desc}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
