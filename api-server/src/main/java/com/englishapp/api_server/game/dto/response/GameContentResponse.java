package com.englishapp.api_server.game.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class GameContentResponse<T> {

    private String gameType;
    private String level;
    private int timeLimit;   // 프론트엔드 타이머 설정용
    private List<T> items;   // 실제 데이터 (단어 리스트 등)
}
