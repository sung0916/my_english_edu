package com.englishapp.api_server.game.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class WordPuzzleDto {

    private int level;
    private int gridSize;
    private List<CrossWordDto> words;
    private List<List<String>> grid;  // 디버깅용 2d 그리드

    @Getter
    @Builder
    public static class CrossWordDto {

        private Long wordId;
        private String word;
        private String clue;
        private int startRow;
        private int startCol;
        private String direction;
    }
}
