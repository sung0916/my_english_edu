package com.englishapp.api_server.game.repository;

import com.englishapp.api_server.entity.User;
import com.englishapp.api_server.game.entity.Game;
import com.englishapp.api_server.game.entity.GameScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GameScoreRepository extends JpaRepository<GameScore, Long> {

    // 유저와 게임으로 기록 조회
    Optional<GameScore> findByUserAndGame(User user, Game game);

    // 특정 유저의 게임 기록 조회 (쿼리를 사용하면 메서드 이름은 마음대로 지어도 됨 - 쿼리가 우선순위)
    List<GameScore> findAllByUser_Id(Long userId);
}
