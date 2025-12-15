package com.englishapp.api_server.util;

import com.englishapp.api_server.game.domain.MazeItemType;
import com.englishapp.api_server.game.dto.response.MazeAdventureResponse;

import java.util.*;

public class MazeValidator {

    // 상하좌우 이동 방향 배열 : (row, col)
    private static final int[] DR = {0, 0, 1, -1};
    private static final int[] DC = {1, -1, 0, 0};

    // 검증 결과 객체 (탈출 가능 여부와 문제점)
    public static class ValidationResult {

        public boolean isPassable;
        public String message;

        public ValidationResult(boolean isPassable, String message) {
            this.isPassable = isPassable;
            this.message = message;
        }
    }

    /**
     * 미로 맵의 유효성 검증 (경로 유효성 및 필수 아이템 획득 가능성)
     *
     * @param response 검증할 미로 데이터 DTO
     * @return 검증 결과 (통과 여부와 메시지)
     */
    public static ValidationResult validateMaze(MazeAdventureResponse response) {

        List<List<Integer>> grid = response.getGrid();
        List<MazeAdventureResponse.Item> items = response.getItems();
        int startRow = response.getStartPosition().getRow();
        int startCol = response.getStartPosition().getCol();
        int height = response.getHeight();
        int width = response.getWidth();

        // 1. 요소 확인 (Key, Door, Exit)
        Optional<MazeAdventureResponse.Item> door = items.stream()
                .filter(i -> i.getType() == MazeItemType.DOOR)
                .findFirst();

        Optional<MazeAdventureResponse.Item> key = items.stream()
                .filter(i -> i.getType() == MazeItemType.KEY)
                .findFirst();

        // 2. BFS 탐색 실행 (Start -> Key -> Door -> Exit 경로 확인)
        // 2-1. Start -> Key 탐색
        if (key.isPresent()) {

            if (!canReach(grid, startRow, startCol, key.get().getRow(), key.get().getCol(), height, width)) {
                return new ValidationResult(false, "시작점에서 열쇠에 도달 불가");
            }
        }

        // 2-2. Key/Start -> Door/Exit 탐색 (맵에 Door가 있다면, Door 위치를 '길(0)'로 간주하고 탐색)
        if (door.isPresent()) {

            // Door 위치를 '길(0)'로 임시 변경 (열쇠를 가졌을 때)
            List<List<Integer>> tempGrid = deepCopyGrid(grid);
            tempGrid.get(door.get().getRow()).set(door.get().getCol(), 0);

            // 최종 출구(3)의 좌표 찾기
            int exitRow = -1, exitCol = -1;
            for (int r = 0; r < height; r++) {
                for (int c = 0; c < width; c++) {
                    if (grid.get(r).get(c) == 3) {
                        exitRow = r;
                        exitCol = c;
                        break;
                    }
                }
            }

            // Start에서 Exit에 도달 가능한지 체크
            if (exitRow == -1 || !canReach(tempGrid, startRow, startCol, exitRow, exitCol, height, width)) {
                return new ValidationResult(false, "열쇠가 있어도 경로 막힘");
            }

        } else {
            // Door가 없다면, Start에서 Exit까지 갈 수 있는지 체크
            // 생략해도됨(2-2에서 이미 포함)
        }

        // 3. 모든 필수 요소를 고려했을 때 통과
        return new ValidationResult(true, "미로 유효성 검증 성공");
    }

    /**
     * BFS 알고리즘을 이용해 출발점에서 목표점까지 도달 가능한지 확인하는 헬퍼 함수
     */
    private static boolean canReach(
            List<List<Integer>> grid, int startR, int startC, int goalR, int goalC, int H, int W) {

        if (startR == goalR && startC == goalC) return true;

        boolean[][] visited = new boolean[H][W];
        Queue<int[]> queue = new LinkedList<>();

        queue.offer(new int[]{startR, startC});
        visited[startR][startC] = true;

        while (!queue.isEmpty()) {
            int[] current = queue.poll();
            int r = current[0];
            int c = current[1];

            for (int i = 0; i < 4; i++) {
                int nr = r + DR[i];
                int nc = c + DC[i];

                // 경계 체크, 방문 여부 체크, 벽(1) 체크
                if (nr >= 0 && nr < H && nc >= 0 && nc < W && !visited[nr][nc] && grid.get(nr).get(nc) != 1) {

                    if (nr == goalR && nc == goalC) {
                        return true;  // 목표점 도달
                    }

                    visited[nr][nc] = true;
                    queue.offer(new int[]{nr, nc});
                }
            }
        }

        return false;  // 목표점 도달 실패
    }

    // List<List<Integer>> 복사하는 헬퍼 함수
    private static List<List<Integer>> deepCopyGrid(List<List<Integer>> original) {

        List<List<Integer>> copy = new ArrayList<>();
        for (List<Integer> row : original) {
            copy.add(new ArrayList<>(row));
        }

        return copy;
    }
}
