package com.englishapp.api_server.game.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class GameScoreResponse {

    private Long gameId;
    private String gameName;
    private int highScore;
    private LocalDateTime updatedAt;
}
