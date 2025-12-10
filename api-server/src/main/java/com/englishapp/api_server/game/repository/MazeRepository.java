package com.englishapp.api_server.game.repository;

import com.englishapp.api_server.game.domain.GameLevel;
import com.englishapp.api_server.game.entity.MazeMap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MazeRepository extends JpaRepository<MazeMap, Long> {

    // 레벨에 맞는 맵 데이터 조회
    Optional<MazeMap> findByLevel(GameLevel level);
}
