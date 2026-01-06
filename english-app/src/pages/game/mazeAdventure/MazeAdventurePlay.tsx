import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { IoArrowUpCircle } from "react-icons/io5";
import GameHeader from "@/components/game/common/GameHeader";
import FlashlightOverlay from "@/components/game/mazeAdventure/FlashlightOverlay";
import useBGM from "@/hooks/game/useBGM";
import useMazeGame from "@/hooks/game/useMazeGame";
import { useGameStore } from "@/store/gameStore";

// 사운드 파일 import
import bumpMp3 from '@/assets/audio/game/maze/bump.mp3';
import getItemMp3 from '@/assets/audio/game/maze/getItem.mp3';
import openDoorMp3 from '@/assets/audio/game/maze/openDoor.mp3';
import trapMp3 from '@/assets/audio/game/maze/trap.mp3';
import useFlashlightMp3 from '@/assets/audio/game/maze/useFlashlight.mp3';
import walkingMp3 from '@/assets/audio/game/maze/walking.mp3';
import correctMp3 from '@/assets/audio/game/correct.mp3';

const AUDIO_URLS = {
    bump: bumpMp3,
    getItem: getItemMp3,
    openDoor: openDoorMp3,
    trap: trapMp3,
    useFlashlight: useFlashlightMp3,
    walking: walkingMp3,
    correct: correctMp3,
};

const CELL_TYPE = { PATH: 0, WALL: 1, START: 2, EXIT: 3 };
const BASE_GAME_CELL_SIZE = 120; // 웹에서는 조금 작게 조정
const BASE_VISIBLE_RADIUS = 1;

export default function MazeAdventureGamePage() {
    const [searchParams] = useSearchParams();
    const gameId = Number(searchParams.get('gameId'));
    const level = searchParams.get('level') || 'FIRST';
    
    const { isPaused, isMuted } = useGameStore();
    const { playSfxWithDucking } = useBGM('mazeadventure');

    const {
        loading, grid, items, playerPos, inventory, logs,
        inputText, setInputText, inputRef, submitCommand,
        trapState, timeLeft
    } = useMazeGame(gameId, level);

    // 컨테이너 크기 (동적 계산)
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

    const [isPreviewMode, setIsPreviewMode] = useState(true);
    const [previewCellSize, setPreviewCellSize] = useState(30); 
    const [previewTimer, setPreviewTimer] = useState(5); 

    // 오디오 객체 관리
    const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

    // 초기화: 오디오 객체 생성
    useEffect(() => {
        Object.entries(AUDIO_URLS).forEach(([key, src]) => {
            audioRefs.current[key] = new Audio(src);
        });
    }, []);

    // 효과음 재생 함수
    const playSound = (soundName: keyof typeof AUDIO_URLS) => {
        if (isMuted) return;
        
        const audio = audioRefs.current[soundName];
        if (!audio) return;

        const playSfx = async () => {
            audio.currentTime = 0;
            try { await audio.play(); } catch (e) {}
        };

        if (soundName === 'walking' || soundName === 'bump') {
            playSfx();
        } else {
            playSfxWithDucking(playSfx, 1500);
        }
    };

    // 상태 변화 감지 및 사운드 재생
    const prevPos = useRef(playerPos);
    const prevInventory = useRef(inventory);
    const prevLogsLen = useRef(0);
    const prevTrap = useRef<string | null>(null);

    useEffect(() => {
        if (loading || isPreviewMode) return;

        // 이동 감지
        if (prevPos.current.row !== playerPos.row || prevPos.current.col !== playerPos.col) {
            if (grid && grid[playerPos.row] && grid[playerPos.row][playerPos.col] === CELL_TYPE.EXIT) {
                playSound('correct');
            } else {
                playSound('walking');
            }
            prevPos.current = playerPos;
        }

        // 아이템 획득 감지
        const gotKey = !prevInventory.current.hasKey && inventory.hasKey;
        const gotFlashlight = inventory.flashlightLevel > prevInventory.current.flashlightLevel;
        if (gotKey || gotFlashlight) playSound('getItem');
        prevInventory.current = inventory;

        // 함정 감지
        if (!prevTrap.current && trapState) playSound('trap');
        prevTrap.current = trapState;

        // 로그 감지 (벽 충돌 등)
        if (logs.length > prevLogsLen.current) {
            const latestLog = logs[logs.length - 1];
            const text = latestLog.text.toLowerCase();
            if (text.includes('wall') || text.includes('blocked') || text.includes('bump')) playSound('bump');
            else if (text.includes('door') && (text.includes('open') || text.includes('unlocked'))) playSound('openDoor');
            else if (text.includes('flashlight') && (text.includes('use') || text.includes('active'))) playSound('useFlashlight');
            prevLogsLen.current = logs.length;
        }
    }, [playerPos, inventory, trapState, logs, loading, isPreviewMode]);

    // 컨테이너 크기 감지 (ResizeObserver)
    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver((entries) => {
            const { width, height } = entries[0].contentRect;
            setContainerSize({ width, height });
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    // 프리뷰 모드 및 타이머
    useEffect(() => {
        if (!loading && grid && containerSize.width > 0) {
            const mapWidth = grid[0].length;
            const mapHeight = grid.length;
            const calcW = (containerSize.width - 40) / mapWidth;
            const calcH = (containerSize.height - 40) / mapHeight;
            setPreviewCellSize(Math.min(calcW, calcH));

            const countdownInterval = setInterval(() => {
                setPreviewTimer(prev => (prev <= 1 ? 0 : prev - 1));
            }, 1000);

            const modeTimer = setTimeout(() => {
                setIsPreviewMode(false);
                prevLogsLen.current = logs.length;
            }, 5000);

            return () => {
                clearTimeout(modeTimer);
                clearInterval(countdownInterval);
            };
        }
    }, [loading, grid, containerSize]);

    // 로그 스크롤 자동 이동
    const logContainerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs]);

    // --- 렌더링 계산 ---
    const gameCellSize = inventory.flashlightLevel > 0 ? BASE_GAME_CELL_SIZE - 20 : BASE_GAME_CELL_SIZE;
    const currentCellSize = isPreviewMode ? previewCellSize : gameCellSize;
    const lightRadius = 200 + (inventory.flashlightLevel * 80);

    // 보드 위치 계산 (중앙 정렬)
    let boardX = 0, boardY = 0;
    if (!loading && grid && containerSize.width > 0) {
        if (isPreviewMode) {
            boardX = (containerSize.width - (grid[0].length * currentCellSize)) / 2;
            boardY = (containerSize.height - (grid.length * currentCellSize)) / 2;
        } else {
            boardX = (containerSize.width / 2) - (playerPos.col * currentCellSize) - (currentCellSize / 2);
            boardY = (containerSize.height / 2) - (playerPos.row * currentCellSize) - (currentCellSize / 2);
        }
    }

    if (loading || !grid) return <div className="flex h-screen items-center justify-center bg-[#1A122E] text-white">Loading...</div>;

    return (
        <div className="flex flex-col h-screen bg-[#1A122E] overflow-hidden relative">
            <GameHeader />

            {/* 상단 정보바 */}
            <div className="flex justify-between items-center p-3 bg-[#2D1B4E] border-b-2 border-[#4527A0] z-20">
                <div className="flex gap-2">
                    <div className={`px-3 py-1 rounded-lg bg-[#4527A0] text-white text-sm font-bold ${inventory.hasKey ? 'bg-[#FF9F1C] opacity-100' : 'opacity-40'}`}>
                        🔑 Key
                    </div>
                    <div className={`px-3 py-1 rounded-lg bg-[#4527A0] text-white text-sm font-bold ${inventory.flashlightLevel > 0 ? 'bg-[#FF9F1C] opacity-100' : 'opacity-40'}`}>
                        🔦 Lv.{inventory.flashlightLevel}
                    </div>
                </div>
                {isPreviewMode ? (
                    <div className="bg-[#F59E0B] px-3 py-1 rounded text-white font-bold text-sm">Memorize! {previewTimer}s</div>
                ) : trapState && (
                    <div className="bg-[#EF4444] px-3 py-1 rounded text-white font-bold text-sm">TRAP! {timeLeft}s</div>
                )}
            </div>

            {/* 게임 보드 영역 */}
            <div ref={containerRef} className="flex-1 relative overflow-hidden bg-[#f7f7f8]">
                <div 
                    className="absolute transition-all duration-500 ease-out will-change-transform"
                    style={{
                        transform: `translate(${boardX}px, ${boardY}px)`
                    }}
                >
                    {grid.map((row, r) => (
                        <div key={r} className="flex">
                            {row.map((cell, c) => {
                                // 시야 제한 로직
                                const distR = Math.abs(r - playerPos.row);
                                const distC = Math.abs(c - playerPos.col);
                                const renderDist = BASE_VISIBLE_RADIUS + inventory.flashlightLevel + 3;
                                
                                if (!isPreviewMode && (distR > renderDist || distC > renderDist)) {
                                    return <div key={`${r}-${c}`} style={{ width: currentCellSize, height: currentCellSize, backgroundColor: '#000' }} />;
                                }

                                const item = items.find(i => i.row === r && i.col === c);
                                const isWall = cell === CELL_TYPE.WALL;

                                return (
                                    <div 
                                        key={`${r}-${c}`} 
                                        className="relative flex items-center justify-center box-border"
                                        style={{ width: currentCellSize, height: currentCellSize }}
                                    >
                                        {isWall ? (
                                            <div className="w-full h-full relative">
                                                <div className="absolute top-0 w-full h-[85%] bg-[#58e666] rounded-t-md z-10" />
                                                <div className="absolute bottom-0 w-full h-[20%] bg-[#263e25] rounded-b-md z-0" />
                                            </div>
                                        ) : (
                                            <div className="w-full h-full bg-[#9bb865] border border-[#3D2C63]/30 flex items-center justify-center text-2xl relative">
                                                <div className="w-1 h-1 bg-[#464448]/30 rounded-full absolute" />
                                                {item?.type === 'KEY' && '🔑'}
                                                {item?.type === 'DOOR' && '🚪'}
                                                {item?.type === 'FLASHLIGHT' && '🔦'}
                                                {(isPreviewMode || trapState) && item?.type === 'TRAP_GHOST' && '👻'}
                                                {(isPreviewMode || trapState) && item?.type === 'TRAP_HOLE' && '🕳️'}
                                                {cell === CELL_TYPE.EXIT && '🏁'}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}

                    {/* 플레이어 (absolute positioning on grid) */}
                    <div 
                        className="absolute z-50 flex items-center justify-center transition-all duration-500 ease-out will-change-transform"
                        style={{
                            width: currentCellSize,
                            height: currentCellSize,
                            left: playerPos.col * currentCellSize,
                            top: playerPos.row * currentCellSize,
                        }}
                    >
                        <div className="text-4xl drop-shadow-md">
                            {trapState === 'TRAP_GHOST' ? '😱' : '🤠'}
                        </div>
                    </div>
                </div>

                {!isPreviewMode && <FlashlightOverlay radius={lightRadius} />}
                {isPaused && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
                        <span className="text-white text-4xl font-bold tracking-widest">PAUSED</span>
                    </div>
                )}
            </div>

            {/* 터미널 로그 */}
            <div className="h-1/3 min-h-[150px] bg-[#0F172A] border-t-2 border-[#334155] flex flex-col">
                <div ref={logContainerRef} className="flex-1 overflow-y-auto p-3 font-mono text-sm space-y-1">
                    {logs.map((l, i) => (
                        <div key={i} className={`
                            ${l.type === 'info' ? 'text-gray-400' : ''}
                            ${l.type === 'success' ? 'text-green-400' : ''}
                            ${l.type === 'error' ? 'text-red-400' : ''}
                            ${l.type === 'warning' ? 'text-yellow-400' : ''}
                        `}>
                            <span className="opacity-50 mr-2">&gt;</span>{l.text}
                        </div>
                    ))}
                </div>

                {/* 입력창 */}
                <div className={`flex items-center p-2 bg-[#1E293B] border-t border-[#334155] ${trapState ? 'border-red-500 border-2' : ''}`}>
                    <span className="text-green-400 font-bold text-lg mr-2">&gt;</span>
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                submitCommand();
                                // 모바일에서 키보드 유지
                                e.preventDefault(); 
                            }
                        }}
                        placeholder={isPreviewMode ? "Game starting..." : trapState ? "TRAP ACTIVE!" : "Enter command..."}
                        className="flex-1 bg-transparent text-white font-mono outline-none placeholder-gray-500"
                        disabled={isPaused || isPreviewMode}
                        autoFocus
                        autoComplete="off"
                    />
                    <button onClick={submitCommand} className="text-[#0EA5E9] hover:text-blue-400 p-1">
                        <IoArrowUpCircle size={32} />
                    </button>
                </div>
            </div>
        </div>
    );
}
