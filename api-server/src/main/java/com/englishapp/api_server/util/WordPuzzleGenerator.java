package com.englishapp.api_server.util;

import com.englishapp.api_server.entity.WordDetail;
import com.englishapp.api_server.game.dto.response.WordPuzzleDto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;

@Component
public class WordPuzzleGenerator {

    private static final String ACROSS = "ACROSS";
    private static final String DOWN = "DOWN";
    private final Random random = new Random();

    public GeneratedPuzzle generate(int gridSize, List<WordDetail> wordCandidates) {

        // 1. 긴 단어부터 배치하여 성공률 높이기
        wordCandidates.sort((a, b) ->
                b.getWord().getContent().length() - a.getWord().getContent().length());

        char[][] grid = new char[gridSize][gridSize];
        List<WordPuzzleDto.CrossWordDto> placeWords = new ArrayList<>();

        // 그리드 초기화 (빈 공간은 0 또는 공백)
        for (int i = 0; i < gridSize; i++) {
            for (int j = 0; j < gridSize; j++) {
                grid[i][j] = '\0';
            }
        }

        // 2. 첫 번째 단어를 정중앙에 가로로 배치
        if (!wordCandidates.isEmpty()) {
            WordDetail first = wordCandidates.get(0);
            String wordStr = first.getWord().getContent().toUpperCase();
            int startRow = gridSize / 2;
            int startCol = (gridSize - wordStr.length()) / 2;

            // 범위 안전 체크 후 배치
            if (startCol >= 0) {
                placeWordOnGrid(grid, wordStr, startRow, startCol, ACROSS);
                placeWords.add(createDto(first, startRow, startCol, ACROSS));
            }
        }

        // 3. 나머지 단어 배치 시도 (백트래킹 방식)
        for (int i = 1; i < wordCandidates.size(); i++) {
            WordDetail candidate = wordCandidates.get(i);
            String currentWord = candidate.getWord().getContent().toUpperCase();
            boolean placed = false;

            // 이미 배치된 단어들을 섞어서 순회 (매번 같은 패턴 방지)
            List<WordPuzzleDto.CrossWordDto> existingWords = new ArrayList<>(placeWords);
            Collections.shuffle(existingWords);

            for (WordPuzzleDto.CrossWordDto existing : existingWords) {
                if (placed) break;
                String existingWord = existing.getWord();

                // 두 단어 간 교차 가능한 알파벳 찾기
                for (int j = 0; j < currentWord.length(); j++) {
                    char charToMatch = currentWord.charAt(j);

                    for (int k = 0; k < existingWord.length(); k++) {
                        if (existingWord.charAt(k) == charToMatch) {  // 교차점 발견

                            // 방향 전환
                            String direction = existing.getDirection().equals(ACROSS) ? DOWN : ACROSS;

                            // 시작 좌표 계산
                            int row = existing.getDirection().equals(ACROSS)
                                    ? existing.getStartRow() - j
                                    : existing.getStartRow() + k;
                            int col = existing.getDirection().equals(ACROSS)
                                    ? existing.getStartCol() + k
                                    : existing.getStartCol() - j;

                            // 배치 가능 여부 체크
                            if (canPlace(grid, currentWord, row, col, direction)) {
                                placeWordOnGrid(grid, currentWord, row, col, direction);
                                placeWords.add(createDto(candidate, row, col, direction));

                                placed = true;
                                break;
                            }
                        }
                    }
                    if (placed) break;
                }
            }
        }
        // 빈칸 랜덤 채우기
        fillEmptySpacesWithRandomChars(grid);

        return new GeneratedPuzzle(grid, placeWords);
    }

    /* 헬퍼 메소드 */
    private void fillEmptySpacesWithRandomChars(char[][] grid) {
        for (int i = 0; i < grid.length; i++) {
            for (int j = 0; j < grid[i].length; j++) {
                if (grid[i][j] == '\0') {
                    // A(65) ~ Z(90) 사이의 랜덤 문자 생성
                    grid[i][j] = (char) ('A' + random.nextInt(26));
                }
            }
        }
    }

    private boolean canPlace(char[][] grid, String word, int row, int col, String direction) {
        int len = word.length();
        int size = grid.length;

        // 1. 범위 체크
        if (direction.equals(ACROSS)) {
            if (col < 0 || col + len > size || row < 0 || row >= size) return false;
        } else {
            if (row < 0 || row + len > size || col < 0 || col >= size) return false;
        }

        // 2. 글자 충돌 및 인접 체크
        for (int i = 0; i < len; i++) {
            int r = direction.equals(ACROSS) ? row : row + i;
            int c = direction.equals(ACROSS) ? col + i : col;
            char cell = grid[r][c];
            char charToPlace = word.charAt(i);

            // [중요] 이미 글자가 있는데, 내가 놓으려는 글자와 다르면 절대 불가 (충돌)
            if (cell != '\0' && cell != charToPlace) return false;

            // [중요] 빈칸인 경우에만 주변 인접 체크 (글자가 붙어버리는 것 방지)
            // 교차점(cell == charToPlace)인 경우는 인접 체크를 하지 않음 (당연히 붙어있으므로)
            if (cell == '\0') {
                if (hasAdjacentLetters(grid, r, c, direction)) return false;
            }
        }

        // 3. 단어 앞뒤가 비어있는지 체크 (Apple뒤에 바로 붙어서 Banana가 오면 안됨)
        int startBeforeR = direction.equals(ACROSS) ? row : row - 1;
        int startBeforeC = direction.equals(ACROSS) ? col - 1 : col;
        if (isValid(size, startBeforeR, startBeforeC) && grid[startBeforeR][startBeforeC] != '\0') return false;

        int endAfterR = direction.equals(ACROSS) ? row : row + len;
        int endAfterC = direction.equals(ACROSS) ? col + len : col;
        if (isValid(size, endAfterR, endAfterC) && grid[endAfterR][endAfterC] != '\0') return false;

        return true;
    }

    private boolean hasAdjacentLetters(char[][] grid, int r, int c, String direction) {

        if (direction.equals(ACROSS)) {
            // 가로 배치 중이면 위/아래 확인
            if (isValid(grid.length, r - 1, c) && grid[r - 1][c] != '\0') return true;
            if (isValid(grid.length, r + 1, c) && grid[r + 1][c] != '\0') return true;
        } else {
            // 세로 배치 중이면 좌/우 확인
            if (isValid(grid.length, r, c - 1) && grid[r][c - 1] != '\0') return true;
            if (isValid(grid.length, r, c + 1) && grid[r][c + 1] != '\0') return true;
        }
        return false;
    }

    private boolean isValid(int size, int r, int c) {

        return r >= 0 && r < size && c >= 0 && c < size;
    }

    private void placeWordOnGrid(char[][] grid, String word, int r, int c, String dir) {

        for (int i = 0; i < word.length(); i++) {
            if (dir.equals(ACROSS)) grid[r][c + i] = word.charAt(i);
            else grid[r + i][c] = word.charAt(i);
        }
    }

    private WordPuzzleDto.CrossWordDto createDto(WordDetail wd, int r, int c, String dir) {

        return WordPuzzleDto.CrossWordDto.builder()
                .wordId(wd.getWord().getId())
                .word(wd.getWord().getContent().toUpperCase())
                .clue(wd.getDescription())
                .startRow(r)
                .startCol(c)
                .direction(dir)
                .build();
    }

    // 결과 반환용 Inner Class
    @Getter
    @AllArgsConstructor
    public static class GeneratedPuzzle {

        private char[][] grid;
        private List<WordPuzzleDto.CrossWordDto> placeWords;
    }
}
