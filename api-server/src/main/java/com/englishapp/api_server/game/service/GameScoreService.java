package com.englishapp.api_server.game.service;

public interface GameScoreService {

    void submitScore(Long userId, Long gameId, int newScore);
}
