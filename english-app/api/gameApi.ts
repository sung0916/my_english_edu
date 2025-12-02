import apiClient from ".";

// 데이터 타입 정의
export interface WordDto {
    id: number;
    content: string;
    meaning: string;
    audioUrl?: string;
}

export interface GameContentResponse {
    gameType: string;
    level: string;
    items: WordDto[];  // 백엔드에선 List<Object>로 주지만, 여기선 WordDto[]로 확정
}

// ============== API 함수 ==============
/** 게임 시작 전 데이터 가져오기
 * GET /api/games/1/playGame?level={level}
 */
export const fetchGameContent = async (gameId: number, level: string): Promise<GameContentResponse> => {
        // 백엔드 Enum은 'FIRST', 'SECOND' 형태이므로 변환 필요
        // 프론트에서 FIRST 등으로 관리하면 그대로 보냄
        const response = await apiClient.get<GameContentResponse>(`/api/games/${gameId}/playGame`, {
            params: { level }
        });
        return response.data;
};

/** 게임 종료 후 점수 제출
 *  POST /api/games/1/updateScore
 */
export const submitGameScore = async (gameId: number, userId: number, score: number) => {
    const response = await apiClient.post(`/api/games/${gameId}/updateScore`, {userId, score});
    return response.data;  // double형도 json에선 숫자로 전송됨
};
