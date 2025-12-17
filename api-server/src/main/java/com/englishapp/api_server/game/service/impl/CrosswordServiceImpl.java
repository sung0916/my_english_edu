package com.englishapp.api_server.game.service.impl;

import com.englishapp.api_server.entity.WordDetail;
import com.englishapp.api_server.game.domain.GameLevel;
import com.englishapp.api_server.game.dto.response.GameContentResponse;
import com.englishapp.api_server.game.dto.response.WordPuzzleDto;
import com.englishapp.api_server.game.repository.WordDetailRepository;
import com.englishapp.api_server.util.WordPuzzleGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class CrosswordServiceImpl {  // Factory Pattern에서 호출될 구현체

    private final WordDetailRepository wordDetailRepository;
    private final WordPuzzleGenerator wordPuzzleGenerator;

    @Transactional(readOnly = true)
    public GameContentResponse<WordPuzzleDto> getCrosswordData(GameLevel level) {

        // 1. 레벨 별 설정 (grid 크기, 단어 길어, 단어 수)
        int gridSize;
        int maxLength;
        int targetWordCount;  // 배치 중 탈라하는 단어들이 있으므로 약 3배수로 조회

        switch (level) {
            case FIRST: gridSize = 5; maxLength = 5; targetWordCount = 5; break;
            case SECOND: gridSize = 7;  maxLength = 7;  targetWordCount = 7; break;
            case THIRD:  gridSize = 9;  maxLength = 7;  targetWordCount = 8; break;
            case FOURTH: gridSize = 11; maxLength = 9;  targetWordCount = 9; break;
            case FIFTH:  gridSize = 13; maxLength = 10; targetWordCount = 10; break;
            default:     gridSize = 7;  maxLength = 7;  targetWordCount = 5;
        }

        // 2. 단어 후보 조회 (생성 실패 확률 대비 3배수 조회)
        List<WordDetail> candidates =
                wordDetailRepository.findRandomWordsForCrossword(maxLength, targetWordCount * 3);

        if (candidates.size() < 2) {
            throw new RuntimeException("단어 수 부족");
        }

        // 3. 퍼즐 생성 시도 (생성 실패 시 재시도)
        WordPuzzleGenerator.GeneratedPuzzle puzzle = null;
        int retryCount = 0;

        while (retryCount < 5) {
            // 매번 셔플해서 조합 시도
            Collections.shuffle(candidates);
            puzzle = wordPuzzleGenerator.generate(gridSize, candidates);

            // 목표 단어 수의 60% 이상 배치되었으면 통과 (너무 엄격하면 무한루프 가능성)
            if (puzzle.getPlaceWords().size() >= targetWordCount * 0.6) {
                break;
            }

            retryCount++;
        }

        // 4. 2차원 char 배열 -> 2차원 String 리스트 변환 (JSON 호환)
        List<List<String>> gridList = new ArrayList<>();
        char[][] grid = puzzle.getGrid();

        for (char[] row : grid) {
            List<String> rowList = new ArrayList<>();

            for (char c : row) {
                rowList.add(c == '\0' ? null : String.valueOf(c));
            }

            gridList.add(rowList);
        }

        // 5-1. Response 생성
        WordPuzzleDto puzzleDto = WordPuzzleDto.builder()
                .level(level.ordinal() + 1)
                .gridSize(gridSize)
                .words(puzzle.getPlaceWords())
                .grid(gridList)
                .build();

        // 5-2. 외부 응답 DTO 생성 및 반환
        return GameContentResponse.<WordPuzzleDto>builder()
                .gameType("CROSSWORDPUZZLE")
                .level(level.name())
                .timeLimit(0)
                .items(List.of(puzzleDto))
                .build();
    }
}
