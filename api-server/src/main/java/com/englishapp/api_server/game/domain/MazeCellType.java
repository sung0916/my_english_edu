package com.englishapp.api_server.game.domain;

// 지형 정보
public enum MazeCellType {

    PATH(0),  // 이동 가능
    WALL(1),  // 이동 불가
    START(2), // 시작 지점
    EXIT(3);  // 탈출구

    private final int value;

    MazeCellType(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }
}
