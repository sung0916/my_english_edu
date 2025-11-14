import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SearchBox, SearchOption } from "../../components/common/SearchBox";
import { crossPlatformAlert } from '../../utils/crossPlatformAlert';

// 나중에 설치할 차트 라이브러리 (예: react-native-chart-kit)
// import { BarChart, LineChart } from 'react-native-chart-kit';

// --- 타입 정의 ---
type ChartType = 'all' | 'game' | 'place' | 'storeView' | 'storeSale';
type LevelType = 'a' | 'b' | 'c';

const Chart = () => {
    // --- 상태 관리 ---
    const [isLoading, setIsLoading] = useState(true);
    const [selectedChart, setSelectedChart] = useState<ChartType>('all');
    const [selectedLevel, setSelectedLevel] = useState<LevelType | null>(null);
    const [chartData, setChartData] = useState<any>(null); // API로부터 받은 데이터를 저장할 상태

    // --- 검색 옵션 정의 ---
    const chartSearchOptions: SearchOption[] = [
        { value: 'all', label: '전체 대시보드' },
        { value: 'game', label: '게임 플레이' },
        { value: 'place', label: '장소 클릭' },
        { value: 'storeView', label: '스토어 조회수' },
        { value: 'storeSale', label: '스토어 판매량' },
    ];
    
    // --- 데이터 로딩 함수 (API 호출) ---
    const fetchChartData = useCallback(async () => {
        setIsLoading(true);
        setChartData(null); // 새 데이터 로드 전 초기화

        // API 엔드포인트를 동적으로 구성
        let apiUrl = `/api/charts/${selectedChart}`;
        if ((selectedChart === 'game' || selectedChart === 'place') && selectedLevel) {
            apiUrl += `?level=${selectedLevel}`;
        }

        console.log(`데이터 요청: ${apiUrl}`);

        try {
            // [API 연동] 동적으로 구성된 URL로 데이터 요청
            // const response = await apiClient.get(apiUrl);
            // setChartData(response.data);

            // --- [임시] API 연동 전까지 사용할 목업(mock) 데이터 ---
            await new Promise(resolve => setTimeout(resolve, 500)); // 로딩 시뮬레이션
            const mockData = {
                'all': { game: [120, 150, 180], place: [80, 90, 70], store: [300, 320, 280] },
                'game': { a: [50, 60], b: [40, 50], c: [30, 40] },
                'place': { a: [40, 30], b: [20, 30], c: [20, 10] },
                'storeView': [1200, 1350, 1100, 1400],
                'storeSale': [50, 65, 55, 70],
            };
            setChartData(mockData);
            // --- 목업 데이터 끝 ---

        } catch (error) {
            console.error("차트 데이터를 불러오는 데 실패했습니다.", error);
            crossPlatformAlert("오류", "차트 데이터를 불러오는 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    }, [selectedChart, selectedLevel]);

    // 선택된 차트나 레벨이 변경될 때마다 데이터를 새로 불러옴
    useEffect(() => {
        fetchChartData();
    }, [fetchChartData]);


    // --- 핸들러 함수 ---
    const handleSearch = (type: string) => {
        setSelectedChart(type as ChartType);
        setSelectedLevel(null); // 메인 차트 종류가 바뀌면 레벨 선택은 초기화
    };

    const handleLevelSelect = (level: LevelType) => {
        setSelectedLevel(level);
    };

    // --- 렌더링 함수 ---

    // 레벨 선택 필터 (게임, 장소 차트에서만 보임)
    const renderLevelFilter = () => {
        if (selectedChart !== 'game' && selectedChart !== 'place') {
            return null;
        }

        const levels: LevelType[] = ['a', 'b', 'c'];
        return (
            <View style={styles.subFilterContainer}>
                {levels.map(level => (
                    <TouchableOpacity
                        key={level}
                        style={[styles.subFilterButton, selectedLevel === level && styles.activeButton]}
                        onPress={() => handleLevelSelect(level)}
                    >
                        <Text style={[styles.subFilterButtonText, selectedLevel === level && styles.activeButtonText]}>
                            {level.toUpperCase()} 레벨
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    // 선택된 차트에 따라 내용을 렌더링
    const renderChartContent = () => {
        if (isLoading) {
            return <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 50 }} />;
        }
        if (!chartData) {
            return <Text style={styles.emptyText}>표시할 데이터가 없습니다.</Text>;
        }

        // TODO: 여기서 chartData를 실제 차트 라이브러리 컴포넌트에 props로 전달합니다.
        // 아래는 실제 차트 대신 간단한 텍스트로 데이터를 표시하는 예시입니다.
        switch (selectedChart) {
            case 'all':
                return (
                    <View>
                        <Text style={styles.chartTitle}>전체 대시보드</Text>
                        <Text>게임 플레이: {JSON.stringify(chartData.all.game)}</Text>
                        <Text>장소 클릭: {JSON.stringify(chartData.all.place)}</Text>
                        <Text>스토어 현황: {JSON.stringify(chartData.all.store)}</Text>
                    </View>
                );
            case 'game':
                return (
                    <View>
                        <Text style={styles.chartTitle}>게임 플레이 차트 {selectedLevel ? `(${selectedLevel.toUpperCase()} 레벨)` : ''}</Text>
                        <Text>데이터: {JSON.stringify(chartData.game)}</Text>
                    </View>
                );
            case 'place':
                 return (
                    <View>
                        <Text style={styles.chartTitle}>장소 클릭 차트 {selectedLevel ? `(${selectedLevel.toUpperCase()} 레벨)` : ''}</Text>
                        <Text>데이터: {JSON.stringify(chartData.place)}</Text>
                    </View>
                );
            case 'storeView':
                return (
                    <View>
                        <Text style={styles.chartTitle}>스토어 조회수</Text>
                        <Text>데이터: {JSON.stringify(chartData.storeView)}</Text>
                    </View>
                );
            case 'storeSale':
                 return (
                    <View>
                        <Text style={styles.chartTitle}>스토어 판매량</Text>
                        <Text>데이터: {JSON.stringify(chartData.storeSale)}</Text>
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <View style={styles.safeArea}>
            <View style={styles.adminContainer}>
                <SearchBox
                    options={chartSearchOptions}
                    onSearch={handleSearch}
                    defaultOption={chartSearchOptions[0]}
                />
                
                {renderLevelFilter()}

                <View style={styles.chartContainer}>
                    {renderChartContent()}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    adminContainer: {
        flex: 1,
        padding: 20,
        paddingTop: Platform.OS === 'android' ? 10 : 0,
    },
    subFilterContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        gap: 10,
        marginTop: 16,
    },
    subFilterButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#dee2e6',
        borderRadius: 20,
    },
    activeButton: {
        backgroundColor: '#007bff',
        borderColor: '#007bff',
    },
    subFilterButtonText: {
        color: '#495057',
        fontWeight: '500',
    },
    activeButtonText: {
        color: '#fff',
    },
    chartContainer: {
        flex: 1,
        marginTop: 24,
        borderWidth: 1,
        borderColor: '#e9ecef',
        borderRadius: 8,
        padding: 16,
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: 'gray',
    },
});

export default Chart;
