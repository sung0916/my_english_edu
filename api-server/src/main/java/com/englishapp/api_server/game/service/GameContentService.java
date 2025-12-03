package com.englishapp.api_server.game.service;

import com.englishapp.api_server.game.domain.GameLevel;
import com.englishapp.api_server.game.dto.response.GameContentResponse;

public interface GameContentService {

    GameContentResponse<?> getGameData(Long gameId, GameLevel level);
}
