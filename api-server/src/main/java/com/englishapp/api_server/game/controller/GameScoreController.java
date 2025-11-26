package com.englishapp.api_server.game.controller;

import com.englishapp.api_server.game.service.GameScoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/scores")
@RequiredArgsConstructor
public class GameScoreController {

    private final GameScoreService gameScoreService;

    /*@PostMapping("/scoreUpdate")
    public ResponseEntity<Void> submitScore(@RequestBody ScoreDto scoreDto) {

        // scoreDto 안에 gameId를 넣어 게임별 구분
        // gameScoreService.submitScore(scoreDto)
        return ResponseEntity.ok().build();
    }*/
}
