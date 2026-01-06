import React from 'react';
import { IoCloseCircle } from "react-icons/io5";

interface Props {
    visible: boolean;
    onClose: () => void;
}

const commands = [
    { cmd: 'Move + [up | down | left | right]', desc: 'Moves you in the specified direction until a wall or a choice point reached'},
    { cmd: 'Return', desc: 'Moves you back to the location you just came from'},
    { cmd: 'Take Key', desc: 'Collect the Key allowing you to open a locked door'},
    { cmd: 'Open Door', desc: 'Unlock and open the door at your current position'},
    { cmd: 'Turn on Flashlight ', desc: 'Activate the Flashlight to gradually increase your visible map area'},
    { cmd: 'Run away', desc: 'Command needed to quickly escape when encountering a Ghost Trap in 15s'},
    { cmd: 'Jump', desc: 'Command needed to quickly leap over a Hole Trap in 10s'},
];

export default function MazeHelpModal({ visible, onClose }: Props) {
    if (!visible) return null;

    // 모달 외부 클릭 시 닫기
    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={handleOverlayClick}
        >
            <div className="bg-white w-[90%] md:w-[60%] max-w-2xl max-h-[80vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-fadeIn">
                
                {/* 헤더 */}
                <div className="flex flex-row justify-between items-center px-6 py-5 border-b border-gray-100 bg-white">
                    <h2 className="text-2xl font-bold text-gray-800">Command Guide</h2>
                    <button 
                        onClick={onClose} 
                        className="text-blue-500 hover:text-blue-600 transition-colors"
                    >
                        <IoCloseCircle size={32} />
                    </button>
                </div>

                {/* 내용 (스크롤 영역) */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                    {commands.map((item, index) => (
                        <div key={index} className="mb-4 last:mb-0 p-4 bg-gray-100 rounded-lg border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-bold text-blue-700 mb-2">{item.cmd}</h3>
                            <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                                {item.desc}
                            </p>
                        </div>
                    ))}
                    <div className="h-4" />
                </div>

                {/* 푸터 */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                    <p className="text-center text-xs text-gray-500">
                        Tip: All commands are case-insensitive.
                    </p>
                </div>
            </div>
        </div>
    );
}
