import { fetchGameContent, submitGameScore } from "@/api/gameApi";
import { useGameStore } from "@/store/gameStore";
import { useUserStore } from "@/store/userStore";
import { crossPlatformConfirm } from "@/utils/crossPlatformAlert";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

// Types
export type CellType = 0 | 1 | 2 | 3;
export type ItemType = 'KEY' | 'DOOR' | 'FLASHLIGHT' | 'TRAP_GHOST' | 'TRAP_HOLE';

export interface MazeItem {
    row: number;
    col: number;
    type: ItemType;
}

export interface Position {
    row: number;
    col: number;
}

export interface Log {
    text: string;
    type: 'info' | 'success' | 'error' | 'warning';
}

// 백엔드 응답 DTO 구조
export interface MazeResponse {
    width: number;
    height: number;
    startPosition: Position;
    grid: number[][];
    items: MazeItem[];
}

// Hooks
export default function useMazeGame(gameId: number, level: string) {
    const navigate = useNavigate();
    const location = useLocation();
    
    const { user } = useUserStore();
    const { setIsPlaying } = useGameStore();

    // 상태 관리
    const [loading, setLoading] = useState(true);
    const [grid, setGrid] = useState<number[][] | null>(null);
    const [items, setItems] = useState<MazeItem[]>([]);
    const [playerPos, setPlayerPos] = useState<Position>({ row: 1, col: 1 });
    const [inventory, setInventory] = useState({ hasKey: false, flashlightLevel: 0 });
    const [logs, setLogs] = useState<Log[]>([]);
    const [inputText, setInputText] = useState('');

    // 함정 관련 상태
    const [trapState, setTrapState] = useState<'TRAP_GHOST' | 'TRAP_HOLE' | null>(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const startPosRef = useRef<Position>({ row: 1, col: 1 });  // 리셋용 시작점 저장
    
    // Web에서는 HTMLInputElement를 사용
    const inputRef = useRef<HTMLInputElement>(null);

    // 초기 데이터 로드
    useEffect(() => {
        const fetchMazeData = async () => {
            if (!user) return;

            try {
                setLoading(true);

                // API 호출 : level 파라미터를 백엔드 Enum에 맞춤
                const response = await fetchGameContent<MazeResponse>(gameId, level);

                if (response.items && response.items.length > 0) {
                    // 백엔드에서 리스트 형태로 오므로 첫번째 요소 사용
                    const data = response.items[0];

                    setGrid(data.grid);
                    setItems(data.items);
                    setPlayerPos(data.startPosition);
                    startPosRef.current = data.startPosition;  // 시작점 저장

                    setLogs([]);  // 로그 초기화
                    addLog(`Welcome to Level ${level}`, 'info');
                    addLog('Type "help" for Commands', 'info');

                    setIsPlaying(true);
                } else {
                    throw new Error("No maze data found");
                }

            } catch (error) {
                console.error('Maze load Error: ', error);
                crossPlatformConfirm('', 'Failed to load maze data', () => navigate(-1));

            } finally {
                setLoading(false);
            }
        };

        fetchMazeData();
    }, [gameId, level]);

    useEffect(() => {
        if (trapState && timeLeft > 0) {
            timerRef.current = setTimeout(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        }
        else if (trapState && timeLeft === 0) {
            handleTrapFail();
        }

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [trapState, timeLeft]);

    // 로그 추가 헬퍼
    const addLog = (text: string, type: Log['type'] = 'info') => {
        setLogs((prev) => [...prev, { text, type }]);
    };

    // 커맨드 처리
    const submitCommand = () => {
        if (!inputText.trim()) return;
        const rawCmd = inputText.trim();
        const cmd = rawCmd.toLowerCase();
        setInputText('');  // 입력창 초기화

        // 함정 상태일때 (특수 커맨드)
        if (trapState) {
            handleTrapCommand(cmd);
            return;
        }

        // 일반 상태 커맨드
        if (['move up'].includes(cmd)) move(-1, 0);
        else if (['move down'].includes(cmd)) move(1, 0);
        else if (['move left'].includes(cmd)) move(0, -1);
        else if (['move right'].includes(cmd)) move(0, 1);
        else if (['take key', 'get key'].includes(cmd)) takeKey();
        else if (['open door', 'unlock door'].includes(cmd)) openDoor();
        else if (['turn on flashlight', 'use flashlight'].includes(cmd)) useFlashlight();
        else if (['help', '?', 'info'].includes(cmd)) showHelp();
        else { addLog('Unknown command. Type "help"', 'error'); }

        setTimeout(() => {
            inputRef.current?.focus();
        }, 10);
    };

    // 이동 로직
    const move = (dr: number, dc: number) => {
        if (!grid) return;

        const nextR = playerPos.row + dr;
        const nextC = playerPos.col + dc;

        // 맵 범위 체크
        if (nextR < 0 || nextR >= grid.length || nextC < 0 || nextC >= grid[0].length) {
            addLog('Blocked! You cannot go that way', 'error');
            return;
        }

        // 벽 체크
        if (grid[nextR][nextC] === 1) {
            addLog('BUMP! You hit a wall', 'error');
            return;
        }

        // 잠긴 문 체크
        const doorItem = items.find(i => i.row === nextR && i.col === nextC && i.type === 'DOOR');

        if (doorItem) {
            addLog('The path is blocked by a locked door', 'warning');
            addLog('Type "open door" if you have a key', 'info');
            return;
        }

        // 이동 성공
        setPlayerPos({ row: nextR, col: nextC });

        // 이동 후 타일 이벤트 체크(함정, 출구 등)
        checkTileEvent(nextR, nextC);
    };

    // 타일 이벤트 체크
    const checkTileEvent = (r: number, c: number) => {
        if (!grid) return;

        // 출구 체크
        if (grid[r][c] === 3) {
            handleWin();
            return;
        }

        // 함정 아이템 체크
        const trapItem = items.find(i => i.row === r && i.col === c && (i.type === 'TRAP_GHOST' || i.type === 'TRAP_HOLE'));

        if (trapItem) {
            triggerTrap(trapItem.type as 'TRAP_GHOST' | 'TRAP_HOLE');
            // 함정 발동 후 제거
            setItems(prev => prev.filter(i => i !== trapItem));
        }
    };

    // 상호작용
    const takeKey = () => {
        const keyItem = items.find(i => i.row === playerPos.row && i.col === playerPos.col && i.type === 'KEY');

        if (keyItem) {
            setInventory(prev => ({ ...prev, hasKey: true }));
            setItems(prev => prev.filter(i => i !== keyItem))  // 맵에서 제거
            addLog('You got a shiny Key 🔑', 'success');

        } else {
            addLog("There is no key here", 'warning');
        }
    };

    const useFlashlight = () => {
        const lightItem = items.find(i => i.row === playerPos.row && i.col === playerPos.col && i.type === 'FLASHLIGHT');

        if (lightItem) {
            setInventory(prev => ({ ...prev, flashlightLevel: prev.flashlightLevel + 1 }));
            setItems(prev => prev.filter(i => i !== lightItem));
            addLog('Flashlight ON! 🔦', 'success');

        } else {
            addLog('No flashlight found here', 'warning');
        }
    };

    const openDoor = () => {
        const neighbors = [
            { r: playerPos.row - 1, c: playerPos.col },
            { r: playerPos.row + 1, c: playerPos.col },
            { r: playerPos.row, c: playerPos.col - 1 },
            { r: playerPos.row, c: playerPos.col + 1 },
        ];

        const doorItem = items.find(i => i.type === 'DOOR' && neighbors.some(n => n.r === i.row && n.c === i.col));

        if (doorItem) {
            if (inventory.hasKey) {
                setItems(prev => prev.filter(i => i !== doorItem));  // 문 제거(열림)
                addLog('Clack..! The door is open', 'success');

            } else {
                addLog("It's locked. You need a Key", 'warning');
            }
        } else {
            addLog('There is no door nearby', 'warning');
        }
    };

    // 함정 로직
    const triggerTrap = (type: 'TRAP_GHOST' | 'TRAP_HOLE') => {
        setTrapState(type);
        setTimeLeft(15);  // 15초 제한

        if (type === 'TRAP_GHOST') {
            addLog('👻 A GHOST APPEARED! Type "Run away" quickly!', 'error');

        } else {
            addLog('🕳️ A HOLE! Type "Jump" quickly!', 'error');
        }
    };

    // 함정 관련 커맨드
    const handleTrapCommand = (cmd: string) => {
        if (trapState === 'TRAP_GHOST' && cmd === 'run away') {
            addLog("You escaped safely!", 'success');
            setTrapState(null);

        } else if (trapState === 'TRAP_HOLE' && cmd === 'jump') {
            addLog("You jumped over the hole!", 'success');
            setTrapState(null);

        } else {
            addLog("Wrong command! Panic!", 'error');
        }
    };

    const handleTrapFail = () => {
        setTrapState(null);
        setPlayerPos(startPosRef.current);  // 시작점으로 강제 이동
        addLog("Too late! You fainted and woke up at the start", 'error');
    };

    // 탈출 성공
    const handleWin = async () => {
        setIsPlaying(false);
        addLog("🎉 CONGRATULATIONS! You escaped!", 'success');

        // 점수 계산
        let score = 1;
        if (level === 'SECOND') score = 2;
        if (level === 'THIRD') score = 3;

        try {
            if (!user) {
                console.error("You're not logged in");
                return;
            }

            await submitGameScore(gameId, user.userId, score);
            
            crossPlatformConfirm(
                '', `You cleared Level ${score}`,
                () => {
                    // Web에서는 경로를 계산하여 이동
                    const lobbyPath = location.pathname.replace('/play', '');
                    navigate(lobbyPath, { replace: true });
                }
            );

        } catch (e) {
            console.error(e);
        }
    };

    const showHelp = () => {
        addLog("--- COMMANDS ---", 'info');
        addLog("move [up/down/left/right]", 'info');
        addLog("take key, open door", 'info');
    };

    return {
        loading,
        grid,
        items,
        setItems,
        playerPos,
        setPlayerPos,
        inventory,
        setInventory,
        logs,
        addLog,
        inputText,
        setInputText,
        inputRef,
        submitCommand,
        trapState,
        setTrapState,  
        timeLeft,
        setTimeLeft,
        startPosRef,
        handleWin,
    };
}
