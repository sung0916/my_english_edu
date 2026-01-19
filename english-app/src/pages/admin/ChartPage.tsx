import React, { useCallback, useEffect, useState } from 'react';
import { crossPlatformAlert } from '@/utils/crossPlatformAlert';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

// Chart.js 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// --- 타입 정의 ---
type ChartType = 'all' | 'game' | 'place' | 'storeView' | 'storeSale';
type LevelType = 'a' | 'b' | 'c';
type StoreType = 'plan' | 'goods'; 

// 카테고리 설정 (버튼용)
const CATEGORIES: { id: ChartType; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'game', label: 'Games' },
    { id: 'place', label: 'Places' },
    { id: 'storeView', label: 'Store Views' },
    { id: 'storeSale', label: 'Sales' },
];

const ChartPage = () => {
    // --- 상태 관리 ---
    const [isLoading, setIsLoading] = useState(true);
    const [selectedChart, setSelectedChart] = useState<ChartType>('all');
    
    // Level은 game, place일 때 사용
    const [selectedLevel, setSelectedLevel] = useState<LevelType | null>(null);
    // StoreType은 storeView, storeSale일 때 사용
    const [selectedStoreType, setSelectedStoreType] = useState<StoreType | null>(null);

    const [chartData, setChartData] = useState<any>(null);

    // --- 카테고리 변경 핸들러 ---
    const handleCategoryChange = (type: ChartType) => {
        setSelectedChart(type);
        
        // 1. 게임/장소 -> Level A 기본 선택
        if (type === 'game' || type === 'place') {
            setSelectedLevel('a');
            setSelectedStoreType(null); // 스토어 타입 초기화
        } 
        // 2. 스토어 조회/판매 -> Plan 기본 선택
        else if (type === 'storeView' || type === 'storeSale') {
            setSelectedStoreType('plan');
            setSelectedLevel(null); // 레벨 초기화
        } 
        // 3. 전체보기 -> 하위 필터 없음
        else {
            setSelectedLevel(null);
            setSelectedStoreType(null);
        }
    };

    // --- 데이터 로딩 ---
    const fetchChartData = useCallback(async () => {
        setIsLoading(true);
        
        try {
            // [API 연동 시뮬레이션]
            await new Promise(resolve => setTimeout(resolve, 400));
            
            const mockData = {
                'all': { 
                    game: [120, 150, 180, 200, 220], 
                    place: [80, 90, 70, 110, 130], 
                    store: [300, 320, 280, 400, 450] 
                },
                'game': { a: [50, 60, 55, 70], b: [40, 50, 45, 55], c: [30, 40, 35, 50] },
                'place': { a: [40, 30, 50], b: [20, 30, 25], c: [20, 10, 15] },
                
                // 구조 변경: 배열 -> 객체 { plan: [], goods: [] }
                'storeView': {
                    plan: [800, 950, 900, 1100, 1200, 1300],  // 수강권 조회수
                    goods: [400, 400, 200, 300, 400, 500]     // 상품 조회수
                },
                'storeSale': {
                    plan: [40, 50, 45, 60, 65, 80],           // 수강권 판매량
                    goods: [10, 15, 10, 10, 15, 15]           // 상품 판매량
                },
            };
            setChartData(mockData);

        } catch (error) {
            crossPlatformAlert("Error", "Failed to load chart data");
        } finally {
            setIsLoading(false);
        }
    }, [selectedChart, selectedLevel, selectedStoreType]); 

    useEffect(() => {
        fetchChartData();
    }, [fetchChartData]);


    // --- 차트 헬퍼 함수들 ---
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' as const },
        },
        scales: {
            y: { beginAtZero: true }
        }
    };

    const generateSingleDataset = (label: string, data: number[], color: string, type: 'line' | 'bar'): ChartData<any> => {
        // x축 라벨 생성 (데이터 길이에 맞춰)
        const labels = data ? data.map((_, i) => `${i + 1} month`) : [];
        
        return {
            labels, 
            datasets: [{
                label,
                data: data || [],
                backgroundColor: type === 'line' ? color : color,
                borderColor: color,
                borderWidth: 2,
                tension: 0.3,
            }],
        };
    };

    const generateMultiDataset = (dataObj: any) => {
        const length = dataObj.game.length;
        return {
            labels: Array.from({length}, (_, i) => `week ${i + 1}`),
            datasets: [
                {
                    label: 'Game Play',
                    data: dataObj.game,
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    tension: 0.3,
                },
                {
                    label: 'Place Visit',
                    data: dataObj.place,
                    borderColor: 'rgb(53, 162, 235)',
                    backgroundColor: 'rgba(53, 162, 235, 0.5)',
                    tension: 0.3,
                },
                {
                    label: 'Sales',
                    data: dataObj.store,
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    tension: 0.3,
                },
            ]
        };
    };

    // --- 렌더링: 차트 본문 ---
    const renderChart = () => {
        if (!chartData) return <div className="flex h-full items-center justify-center text-gray-400">데이터 준비 중...</div>;
        
        const loadingClass = isLoading ? "opacity-50 pointer-events-none transition-opacity" : "opacity-100 transition-opacity";
        let content = null;
        
        switch (selectedChart) {
            case 'all':
                content = <Line options={commonOptions} data={generateMultiDataset(chartData.all)} />;
                break;

            case 'game': {
                const data = (selectedLevel && chartData.game[selectedLevel]) || [];
                content = <Line options={commonOptions} data={generateSingleDataset(`Game Play (Lv.${selectedLevel?.toUpperCase()})`, data, 'rgb(255, 99, 132)', 'line')} />;
                break;
            }
            case 'place': {
                const data = (selectedLevel && chartData.place[selectedLevel]) || [];
                content = <Bar options={commonOptions} data={generateSingleDataset(`Visits (Lv.${selectedLevel?.toUpperCase()})`, data, 'rgb(53, 162, 235)', 'bar')} />;
                break;
            }
            
            // --- Store 관련 케이스 수정 ---
            case 'storeView': {
                // 선택된 StoreType(plan/goods)에 따른 데이터 추출
                const data = (selectedStoreType && chartData.storeView[selectedStoreType]) || [];
                const label = selectedStoreType === 'plan' ? 'Subscription Views' : 'Goods Views';
                const color = selectedStoreType === 'plan' ? 'rgb(75, 192, 192)' : 'rgb(153, 102, 255)'; // 색상 차별화
                
                content = <Line options={commonOptions} data={generateSingleDataset(label, data, color, 'line')} />;
                break;
            }
            case 'storeSale': {
                // 선택된 StoreType(plan/goods)에 따른 데이터 추출
                const data = (selectedStoreType && chartData.storeSale[selectedStoreType]) || [];
                const label = selectedStoreType === 'plan' ? 'Subscription Sales' : 'Goods Sales';
                const color = selectedStoreType === 'plan' ? 'rgb(255, 205, 86)' : 'rgb(255, 159, 64)'; // 색상 차별화

                content = <Bar options={commonOptions} data={generateSingleDataset(label, data, color, 'bar')} />;
                break;
            }
        }

        return (
            <div className={`relative w-full h-[400px] ${loadingClass}`}>
                {content}
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-gray-600 font-semibold bg-white px-4 py-2 rounded shadow">Loading...</span>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm min-h-[600px]">
            {/* 1. 메인 카테고리 탭 */}
            <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-800 mb-3">Categories</h2>
                <div className="flex flex-wrap gap-2 p-1 bg-gray-100 rounded-lg w-fit">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => handleCategoryChange(cat.id)}
                            className={`
                                px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200
                                ${selectedChart === cat.id
                                    ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' 
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                                }
                            `}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. 서브 필터 영역 (조건부 렌더링) */}
            <div className="min-h-[40px] mb-2"> {/* 높이 고정으로 UI 덜컥거림 방지 */}
                
                {/* A. Level 필터 (Game, Place) */}
                {(selectedChart === 'game' || selectedChart === 'place') && (
                    <div className="flex items-center gap-3 animate-fadeIn">
                        <div className="flex gap-2">
                            {(['a', 'b', 'c'] as LevelType[]).map((level) => (
                                <button
                                    key={level}
                                    onClick={() => setSelectedLevel(level)}
                                    className={`
                                        px-4 py-1.5 rounded-full text-xs font-bold border transition-colors
                                        ${selectedLevel === level
                                            ? 'bg-blue-100 text-blue-700 border-blue-300'
                                            : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                                        }
                                    `}
                                >
                                    {level.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* B. Store Type 필터 (StoreView, StoreSale) - [NEW] */}
                {(selectedChart === 'storeView' || selectedChart === 'storeSale') && (
                    <div className="flex items-center gap-3 animate-fadeIn">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setSelectedStoreType('plan')}
                                className={`
                                    px-4 py-1.5 rounded-full text-xs font-bold border transition-colors
                                    ${selectedStoreType === 'plan'
                                        ? 'bg-green-100 text-green-700 border-green-300'
                                        : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                                    }
                                `}
                            >
                                PLAN
                            </button>
                            <button
                                onClick={() => setSelectedStoreType('goods')}
                                className={`
                                    px-4 py-1.5 rounded-full text-xs font-bold border transition-colors
                                    ${selectedStoreType === 'goods'
                                        ? 'bg-purple-100 text-purple-700 border-purple-300'
                                        : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                                    }
                                `}
                            >
                                GOODS
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* 3. 차트 영역 */}
            <div className="border border-gray-200 rounded-xl p-6 bg-white">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        {CATEGORIES.find(c => c.id === selectedChart)?.label}
                        
                        {/* 선택된 옵션 뱃지 표시 */}
                        {selectedLevel && (
                            <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-md">
                                Lv.{selectedLevel.toUpperCase()}
                            </span>
                        )}
                        {selectedStoreType && (
                            <span className={`text-xs px-2 py-1 rounded-md ${selectedStoreType === 'plan' ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'}`}>
                                {selectedStoreType === 'plan' ? 'Plan' : 'Goods'}
                            </span>
                        )}
                    </h3>
                    <span className="text-xs text-gray-400">
                        Last updated: {new Date().toLocaleDateString()}
                    </span>
                </div>
                
                {renderChart()}
            </div>
        </div>
    );
};

export default ChartPage;
