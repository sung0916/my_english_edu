package com.englishapp.api_server.game.controller;

import com.englishapp.api_server.game.dto.GameLevel;
import com.englishapp.api_server.game.dto.request.GameScoreRequest;
import com.englishapp.api_server.game.dto.response.GameContentResponse;
import com.englishapp.api_server.game.service.GameContentService;
import com.englishapp.api_server.game.service.GameScoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/games")
@RequiredArgsConstructor
public class GameController {

    private final GameContentService gameContentService;
    private final GameScoreService gameScoreService;

    // 게임 플레이
    @GetMapping("/{gameId}/playGame")
    public ResponseEntity<GameContentResponse<?>> getGamePlayData(
            @PathVariable Long gameId,
            @RequestParam(defaultValue = "FIRST") GameLevel level) {

        GameContentResponse<?> response = gameContentService.getGameData(gameId, level);
        return ResponseEntity.ok(response);
    }

    // 게임 플레이 후 점수 제출
    @PostMapping("/{gameId}/updateScore")
    public ResponseEntity<Void> submitScore(
            @PathVariable Long gameId,
            @RequestBody GameScoreRequest request) {

        // request 객체 안에 gameId가 있어도 되고, 없으면 PathVariable을 사용
        // 여기서는 명확성을 위해 PathVariable의 gameId를 서비스에 넘김
        gameScoreService.submitScore(request.getUserId(), gameId, request.getScore());
        return ResponseEntity.ok().build();
    }
}
