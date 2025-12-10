package com.englishapp.api_server.game.entity;

import com.englishapp.api_server.game.domain.GameLevel;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "maze_maps")
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MazeMap {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maze_map_id")
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GameLevel level;

    private int width;
    private int height;

    // 시작 지점(컬럼으로 빼두면 쿼리, 로직 짤 때 유용)
    private int startRow;
    private int startCol;

    // 지형 데이터 (JSON String으로 저장)
    // 형태 : [[1, 1, 0], [0, 1, 0], ...]
    @Column(columnDefinition = "json")  //MySQL JSON 타입
    private String gridData;

    // 아이템 배치 데이터 (JSON String으로 저장)
    // 형태 : [{"row": 2, "col": 3, "type": "KEY"}, {"row": 5, "col": 5, "type": "TRAP_GHOST"}, ...]
    @Column(columnDefinition = "json")
    private String itemData;

    @Builder
    public MazeMap(
            GameLevel level, int width, int height, int startRow, int startCol, String gridData, String itemData) {

        this.level = level;
        this.width = width;
        this.height = height;
        this.startRow = startRow;
        this.startCol = startCol;
        this.gridData = gridData;
        this.itemData = itemData;
    }
}
