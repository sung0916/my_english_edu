package com.englishapp.api_server.game.dto.request;

import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class GameScoreRequest {

    private Long gameId;
    private Long userId;
    private int score;
    private LocalDateTime playedAt;
}
