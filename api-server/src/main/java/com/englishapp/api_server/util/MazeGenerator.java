package com.englishapp.api_server.util;

import com.englishapp.api_server.game.domain.MazeCellType;
import com.englishapp.api_server.game.domain.MazeItemType;
import com.englishapp.api_server.game.dto.response.MazeAdventureResponse;

import java.util.*;

public class MazeGenerator {

    private static final int[] DR = {-2, 2, 0, 0};
    private static final int[] DC = {0, 0, -2, 2};
    // BFS 탐색용 상하좌우 (1칸씩)
    private static final int[] MOVE_R = {-1, 1, 0, 0};
    private static final int[] MOVE_C = {0, 0, -1, 1};

    public static MazeAdventureResponse generate(int rows, int cols, int trapCount) {
        // 1. 초기화 (전체 벽)
        List<List<Integer>> grid = new ArrayList<>();
        for (int i = 0; i < rows; i++) {
            List<Integer> row = new ArrayList<>(Collections.nCopies(cols, MazeCellType.WALL.getValue()));
            grid.add(row);
        }

        // 2. 길 뚫기 (1,1에서 시작)
        carve(grid, 1, 1);

        // 3. 입구(Start)와 출구(Exit) 뚫기
        grid.get(0).set(1, MazeCellType.START.getValue());
        grid.get(1).set(1, MazeCellType.PATH.getValue()); // 입구 앞 길

        MazeAdventureResponse.Position startPos = new MazeAdventureResponse.Position(0, 1);
        MazeAdventureResponse.Position exitPos = setExitPointOnEdge(grid, rows, cols);

        // 4. [핵심] 정답 경로(Solution Path) 찾기 (Start -> Exit)
        List<Point> solutionPath = findSolutionPath(grid, startPos, exitPos);

        // 5. 아이템 배치 (Solution Path 정보를 활용하여 Key/Door 배치)
        List<MazeAdventureResponse.Item> items = placeItems(grid, trapCount, solutionPath);

        return MazeAdventureResponse.builder()
                .width(cols)
                .height(rows)
                .startPosition(startPos)
                .grid(grid)
                .items(items)
                .build();
    }

    // =========================================================
    // 🗝️ Key & Door 배치 로직 (핵심)
    // =========================================================
    private static List<MazeAdventureResponse.Item> placeItems(
            List<List<Integer>> grid, int trapCount, List<Point> solutionPath) {

        List<MazeAdventureResponse.Item> items = new ArrayList<>();
        Random random = new Random();
        int rows = grid.size();
        int cols = grid.get(0).size();

        // 1. Key & Door 배치 (반드시 1세트 배치)
        if (solutionPath != null && solutionPath.size() > 10) {
            // 경로가 너무 짧으면 배치 안함 (예외 처리)

            // A. 문(Door) 위치 선정: 전체 경로의 50% ~ 90% 사이 지점 중 하나
            // (출구 바로 앞은 피하기 위해 -2)
            int minDoorIdx = (int)(solutionPath.size() * 0.5);
            int maxDoorIdx = solutionPath.size() - 2;
            int doorPathIdx = random.nextInt(maxDoorIdx - minDoorIdx + 1) + minDoorIdx;

            Point doorPoint = solutionPath.get(doorPathIdx);
            items.add(new MazeAdventureResponse.Item(doorPoint.r, doorPoint.c, MazeItemType.DOOR));

            // B. 열쇠(Key) 위치 선정: 시작점(index 1) ~ 문 위치(index doorPathIdx - 1) 사이
            // 0번 인덱스는 시작점(START)이므로 제외
            int keyPathIdx = random.nextInt(doorPathIdx - 1) + 1;
            Point keyPoint = solutionPath.get(keyPathIdx);
            items.add(new MazeAdventureResponse.Item(keyPoint.r, keyPoint.c, MazeItemType.KEY));

        } else {
            // 경로 탐색 실패 시 랜덤 배치 (Fallback)
            placeSingleItem(grid, items, MazeItemType.KEY, random, rows, cols);
            // 문은 경로를 막지 못하면 의미가 없으므로 Fallback에선 생략하거나 랜덤 배치
        }

        // 2. 손전등 (Flashlight) 배치 - 랜덤 (길 위 아무데나)
        if (random.nextBoolean()) {
            placeSingleItem(grid, items, MazeItemType.FLASHLIGHT, random, rows, cols);
        }

        // 3. 함정 (Trap) 배치 - 랜덤
        for (int i = 0; i < trapCount; i++) {
            MazeItemType trapType = random.nextBoolean() ? MazeItemType.TRAP_GHOST : MazeItemType.TRAP_HOLE;
            placeSingleItem(grid, items, trapType, random, rows, cols);
        }

        return items;
    }

    // =========================================================
    // 🧠 BFS 경로 탐색 (Solver)
    // =========================================================
    private static List<Point> findSolutionPath(
            List<List<Integer>> grid,
            MazeAdventureResponse.Position start,
            MazeAdventureResponse.Position exit) {

        int rows = grid.size();
        int cols = grid.get(0).size();
        boolean[][] visited = new boolean[rows][cols];
        // 경로 역추적을 위한 부모 노드 저장 맵: Child -> Parent
        Map<Point, Point> parentMap = new HashMap<>();

        Queue<Point> queue = new LinkedList<>();
        Point startPt = new Point(start.getRow(), start.getCol());
        queue.add(startPt);
        visited[startPt.r][startPt.c] = true;

        Point exitPt = null;

        while(!queue.isEmpty()) {
            Point curr = queue.poll();

            // 도착점 도달 확인
            if (curr.r == exit.getRow() && curr.c == exit.getCol()) {
                exitPt = curr;
                break;
            }

            // 4방향 탐색
            for(int i=0; i<4; i++) {
                int nr = curr.r + MOVE_R[i];
                int nc = curr.c + MOVE_C[i];

                if(nr >=0 && nr < rows && nc >= 0 && nc < cols && !visited[nr][nc]) {
                    int cellVal = grid.get(nr).get(nc);
                    // 벽(1)이 아니면 이동 가능 (0, 2, 3)
                    if(cellVal != MazeCellType.WALL.getValue()) {
                        visited[nr][nc] = true;
                        Point next = new Point(nr, nc);
                        queue.add(next);
                        parentMap.put(next, curr); // 경로 기록
                    }
                }
            }
        }

        // 경로가 없으면 null 반환
        if (exitPt == null) return null;

        // 역추적하여 경로 리스트 생성 (Exit -> Start)
        List<Point> path = new ArrayList<>();
        Point curr = exitPt;
        while(curr != null) {
            path.add(curr);
            curr = parentMap.get(curr);
        }
        // Start -> Exit 순서로 뒤집기
        Collections.reverse(path);
        return path;
    }

    // 좌표 클래스 (Helper)
    private static class Point {
        int r, c;
        Point(int r, int c) { this.r = r; this.c = c; }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            Point point = (Point) o;
            return r == point.r && c == point.c;
        }

        @Override
        public int hashCode() {
            return Objects.hash(r, c);
        }
    }

    // =========================================================
    // 🧱 기본 생성 로직 (Carve, Edge Exit)
    // =========================================================
    private static void carve(List<List<Integer>> grid, int r, int c) {
        grid.get(r).set(c, MazeCellType.PATH.getValue());
        List<Integer> directions = Arrays.asList(0, 1, 2, 3);
        Collections.shuffle(directions);

        for (int dir : directions) {
            int nr = r + DR[dir];
            int nc = c + DC[dir];

            if (nr > 0 && nr < grid.size() - 1 && nc > 0 && nc < grid.get(0).size() - 1
                    && grid.get(nr).get(nc) == MazeCellType.WALL.getValue()) {
                grid.get(r + DR[dir] / 2).set(c + DC[dir] / 2, MazeCellType.PATH.getValue());
                carve(grid, nr, nc);
            }
        }
    }

    private static MazeAdventureResponse.Position setExitPointOnEdge(List<List<Integer>> grid, int rows, int cols) {
        for (int c = cols - 2; c > 0; c--) {
            if (grid.get(rows - 2).get(c) == MazeCellType.PATH.getValue()) {
                grid.get(rows - 1).set(c, MazeCellType.EXIT.getValue());
                return new MazeAdventureResponse.Position(rows - 1, c);
            }
        }
        for (int r = rows - 2; r > 0; r--) {
            if (grid.get(r).get(cols - 2) == MazeCellType.PATH.getValue()) {
                grid.get(r).set(cols - 1, MazeCellType.EXIT.getValue());
                return new MazeAdventureResponse.Position(r, cols - 1);
            }
        }
        grid.get(rows - 1).set(cols - 2, MazeCellType.EXIT.getValue());
        return new MazeAdventureResponse.Position(rows - 1, cols - 2);
    }

    // 랜덤 아이템 배치 헬퍼 (함정, 손전등용)
    private static void placeSingleItem(
            List<List<Integer>> grid, List<MazeAdventureResponse.Item> items,
            MazeItemType type, Random random, int rows, int cols) {

        for(int attempt=0; attempt<50; attempt++) { // 무한루프 방지
            int r = random.nextInt(rows - 2) + 1;
            int c = random.nextInt(cols - 2) + 1;

            boolean isStartArea = (r <= 1 && c == 1);
            boolean isPath = (grid.get(r).get(c) == MazeCellType.PATH.getValue());
            boolean hasItem = items.stream().anyMatch(i -> i.getRow() == r && i.getCol() == c);

            if (isPath && !isStartArea && !hasItem) {
                items.add(new MazeAdventureResponse.Item(r, c, type));
                break;
            }
        }
    }
}
