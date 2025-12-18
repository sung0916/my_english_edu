package com.englishapp.api_server.game.service;

import com.englishapp.api_server.game.dto.response.GameScoreResponse;

import java.util.List;

public interface GameScoreService {

    void submitScore(Long userId, Long gameId, int newScore);

    List<GameScoreResponse> getUserGameScores(Long userId);
}
