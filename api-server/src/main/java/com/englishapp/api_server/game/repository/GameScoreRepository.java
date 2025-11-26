package com.englishapp.api_server.game.repository;

import com.englishapp.api_server.entity.User;
import com.englishapp.api_server.game.entity.Game;
import com.englishapp.api_server.game.entity.GameScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GameScoreRepository extends JpaRepository<GameScore, Long> {

    // 유저와 게임으로 기록 조회
    Optional<GameScore> findByUserAndGame(User user, Game game);
}
