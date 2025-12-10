package com.englishapp.api_server.game.dto.response;

import com.englishapp.api_server.game.domain.MazeItemType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MazeAdventureResponse {

    private int width;
    private int height;

    // 시작 위치 (내부 클래스 활용)
    private Position startPosition;

    // 지형 데이터 (0: 길, 1: 벽, 3: 출구)
    private List<List<Integer>> grid;

    // 아이템 리스트 (내부 클래스 활용)
    private List<Item> items;

    // 내부 클래스 정의 (Static Inner Class)
    @Getter
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Position {
        private int row;
        private int col;
    }

    // 내부 클래스 정의 (Static Inner Class)
    @Getter
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Item {
        private int row;
        private int col;
        private MazeItemType type;
    }
}
