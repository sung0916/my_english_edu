import React, { useCallback, useEffect, useState } from 'react';
import { SearchBox, SearchOption } from "@/components/common/SearchBox";
import { crossPlatformAlert } from '@/utils/crossPlatformAlert';

// 1. 차트 라이브러리 임포트 및 등록
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

// Chart.js 컴포넌트 등록 (필수)
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

const ChartPage = () => {
    // --- 상태 관리 ---
    const [isLoading, setIsLoading] = useState(true);
    const [selectedChart, setSelectedChart] = useState<ChartType>('all');
    const [selectedLevel, setSelectedLevel] = useState<LevelType | null>(null);
    const [chartData, setChartData] = useState<any>(null);

    const chartSearchOptions: SearchOption[] = [
        { value: 'all', label: '전체 대시보드 (종합)' },
        { value: 'game', label: '게임 플레이 (Line)' },
        { value: 'place', label: '장소 클릭 (Bar)' },
        { value: 'storeView', label: '스토어 조회수 (Line)' },
        { value: 'storeSale', label: '스토어 판매량 (Bar)' },
    ];

    // --- 데이터 로딩 ---
    const fetchChartData = useCallback(async () => {
        setIsLoading(true);
        setChartData(null);

        try {
            // [API 연동 시뮬레이션]
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // 실제로는 API에서 받아온 데이터를 그대로 setChartData에 넣으면 됩니다.
            const mockData = {
                'all': { 
                    game: [120, 150, 180, 200, 220], 
                    place: [80, 90, 70, 110, 130], 
                    store: [300, 320, 280, 400, 450] 
                },
                'game': { a: [50, 60, 55, 70], b: [40, 50, 45, 55], c: [30, 40, 35, 50] },
                'place': { a: [40, 30, 50], b: [20, 30, 25], c: [20, 10, 15] },
                'storeView': [1200, 1350, 1100, 1400, 1600, 1800],
                'storeSale': [50, 65, 55, 70, 80, 95],
            };
            setChartData(mockData);

        } catch (error) {
            crossPlatformAlert("오류", "데이터 로드 실패");
        } finally {
            setIsLoading(false);
        }
    }, [selectedChart, selectedLevel]);

    useEffect(() => {
        fetchChartData();
    }, [fetchChartData]);

    // --- 차트 옵션 (공통) ---
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false, // 부모 div 크기에 맞춤
        plugins: {
            legend: { position: 'top' as const },
        },
    };

    // --- 차트 데이터 변환 헬퍼 함수 ---
    const generateChartConfig = (label: string, data: number[], color: string): ChartData<any> => {
        return {
            // 데이터 개수만큼 라벨 생성 (예: 1월, 2월...)
            labels: data.map((_, i) => `${i + 1}월`), 
            datasets: [
                {
                    label: label,
                    data: data,
                    backgroundColor: color, // 막대 색상
                    borderColor: color,     // 선 색상
                    borderWidth: 2,
                    tension: 0.3, // 선 곡선 처리
                },
            ],
        };
    };

    // --- 멀티 데이터셋 헬퍼 (전체 대시보드용) ---
    const generateMultiConfig = (dataObj: any) => {
        const length = dataObj.game.length; // 데이터 길이 기준
        return {
            labels: Array.from({length}, (_, i) => `${i + 1}주차`),
            datasets: [
                {
                    label: '게임 플레이',
                    data: dataObj.game,
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    tension: 0.3,
                },
                {
                    label: '장소 클릭',
                    data: dataObj.place,
                    borderColor: 'rgb(53, 162, 235)',
                    backgroundColor: 'rgba(53, 162, 235, 0.5)',
                    tension: 0.3,
                },
                {
                    label: '스토어 방문',
                    data: dataObj.store,
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    tension: 0.3,
                },
            ]
        };
    };

    // --- 렌더링: 레벨 필터 ---
    const renderLevelFilter = () => {
        if (selectedChart !== 'game' && selectedChart !== 'place') return null;
        
        return (
            <div className="flex flex-row gap-2 mt-4">
                {['a', 'b', 'c'].map((level) => (
                    <button
                        key={level}
                        onClick={() => setSelectedLevel(level as LevelType)}
                        className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors
                            ${selectedLevel === level 
                                ? 'bg-blue-500 text-white border-blue-500' 
                                : 'bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100'
                            }
                        `}
                    >
                        {level.toUpperCase()} 레벨
                    </button>
                ))}
            </div>
        );
    };

    // --- 렌더링: 차트 본문 ---
    const renderChartContent = () => {
        if (isLoading) return <div className="text-center text-gray-500 py-20">Loading...</div>;
        if (!chartData) return <div className="text-center text-gray-500 py-20">데이터가 없습니다.</div>;

        let chartComponent;
        const heightClass = "h-[400px] w-full"; // 차트 높이 고정

        switch (selectedChart) {
            case 'all':
                // 전체 대시보드: Line Chart로 여러 데이터 비교
                chartComponent = <Line options={commonOptions} data={generateMultiConfig(chartData.all)} />;
                break;

            case 'game':
                // 게임 플레이: Line Chart
                // 레벨이 선택되었다면 해당 레벨 데이터, 아니면 전체 합산 등 처리 (여기선 예시로 A레벨 기본값 처리)
                const gameData = selectedLevel ? chartData.game[selectedLevel] : chartData.game['a'];
                chartComponent = <Line options={commonOptions} data={generateChartConfig('게임 플레이 수', gameData, 'rgb(255, 99, 132)')} />;
                break;

            case 'place':
                // 장소 클릭: Bar Chart
                const placeData = selectedLevel ? chartData.place[selectedLevel] : chartData.place['a'];
                chartComponent = <Bar options={commonOptions} data={generateChartConfig('장소 클릭 수', placeData, 'rgb(53, 162, 235)')} />;
                break;

            case 'storeView':
                // 스토어 조회: Line Chart
                chartComponent = <Line options={commonOptions} data={generateChartConfig('스토어 조회수', chartData.storeView, 'rgb(75, 192, 192)')} />;
                break;

            case 'storeSale':
                // 스토어 판매: Bar Chart
                chartComponent = <Bar options={commonOptions} data={generateChartConfig('스토어 판매량', chartData.storeSale, 'rgb(255, 205, 86)')} />;
                break;
                
            default:
                chartComponent = null;
        }

        return (
            <div className={heightClass}>
                {chartComponent}
            </div>
        );
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm min-h-full">
            <SearchBox 
                options={chartSearchOptions} 
                onSearch={(type) => {
                    setSelectedChart(type as ChartType);
                    setSelectedLevel(null);
                }}
                defaultOption={chartSearchOptions[0]}
            />
            
            {renderLevelFilter()}

            <div className="mt-6 border border-gray-200 rounded-lg p-6 bg-white">
                <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-2">
                    {selectedChart === 'all' ? '전체 대시보드' : 
                        chartSearchOptions.find(o => o.value === selectedChart)?.label}
                    {selectedLevel && ` (${selectedLevel.toUpperCase()} 레벨)`}
                </h2>
                
                {/* 차트 영역 */}
                {renderChartContent()}
            </div>
        </div>
    );
};

export default ChartPage;
