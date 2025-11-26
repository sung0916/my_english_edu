package com.englishapp.api_server.game.service.impl;

import com.englishapp.api_server.entity.User;
import com.englishapp.api_server.game.entity.Game;
import com.englishapp.api_server.game.entity.GameScore;
import com.englishapp.api_server.game.repository.GameRepository;
import com.englishapp.api_server.game.repository.GameScoreRepository;
import com.englishapp.api_server.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class GameServiceImpl {

    private final GameScoreRepository gameScoreRepository;
    private final UserRepository userRepository;
    private final GameRepository gameRepository;

    public void submitScore(Long userId, Long gameId, int newScore) {

        // 엔티티 조회 (프록시 객체 조회가 성능 상 유리할 수 있으나, 안전하게 조회)
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자 조회 실패"));

        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new IllegalArgumentException("게임 찾기 실패"));

        // 기존 기록 유무 체크
        Optional<GameScore> existingScore = gameScoreRepository.findByUserAndGame(user, game);

        if (existingScore.isPresent()) {  // 기존 기록 존재 (점수 비교 후 갱신)
            GameScore score = existingScore.get();
            boolean isUpdated = score.updateHighScore(newScore);

            // JPA의 Dirty Checking으로 save 호출없이 트랜젝션이 끝날 때 isUpdated가 true이면 DB에 업데이트

        } else {  // 기존 기록 없음 (새로 생성)
            GameScore newGameScore = GameScore.builder()
                    .user(user)
                    .game(game)
                    .highScore(newScore)
                    .build();

            gameScoreRepository.save(newGameScore);
        }
    }
}
