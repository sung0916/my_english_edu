package com.englishapp.api_server.game.service.impl;

import com.englishapp.api_server.entity.User;
import com.englishapp.api_server.game.dto.response.GameScoreResponse;
import com.englishapp.api_server.game.entity.Game;
import com.englishapp.api_server.game.entity.GameScore;
import com.englishapp.api_server.game.repository.GameRepository;
import com.englishapp.api_server.game.repository.GameScoreRepository;
import com.englishapp.api_server.game.service.GameScoreService;
import com.englishapp.api_server.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class GameScoreServiceImpl implements GameScoreService {

    private final GameScoreRepository gameScoreRepository;
    private final UserRepository userRepository;
    private final GameRepository gameRepository;

    // 게임 점수 비교 및 저장
    @Override
    @Transactional
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

            // isUpdated의 log
            if (isUpdated) {
                log.info("사용자 '{}'가 {}번 게임에서 {}점 갱신", userId, gameId, newScore);
            }

        } else {  // 기존 기록 없음 (새로 생성)
            GameScore newGameScore = GameScore.builder()
                    .user(user)
                    .game(game)
                    .highScore(newScore)
                    .build();

            gameScoreRepository.save(newGameScore);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<GameScoreResponse> getUserGameScores(Long userId) {

        List<GameScore> scores = gameScoreRepository.findAllByUser_Id(userId);

        return scores.stream()
                .map(score -> GameScoreResponse.builder()
                        .gameId(score.getGame().getId())
                        .gameName(String.valueOf(score.getGame().getGameName()))
                        .highScore(score.getHighScore())
                        .updatedAt(score.getPlayedAt())
                        .build())
                .collect(Collectors.toList());
    }
}
