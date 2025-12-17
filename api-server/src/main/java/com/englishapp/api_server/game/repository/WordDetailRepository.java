package com.englishapp.api_server.game.repository;

import com.englishapp.api_server.entity.WordDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WordDetailRepository extends JpaRepository<WordDetail, Long> {

    // 1. 문제를 낼 정답 데이터 N개 랜덤 조회 (Word 정보도 같이 가져옴 - Fetch Join / DISTINCT를 적용하여 중복된 word_id가 나오지 않게 함)
    @Query(value = "SELECT DISTINCT wd FROM WordDetail wd JOIN FETCH wd.word ORDER BY RAND() LIMIT :limit")
    List<WordDetail> findRandomQuestions(@Param("limit") int limit);

    // 2. 오답용 보기 데이터 M개 랜덤 조회 (정답과 겹치지 않게 로직 처리 필요하지만, 일단 랜덤으로 가져옴)
    @Query(value = "SELECT DISTINCT wd FROM WordDetail wd JOIN FETCH wd.word ORDER BY RAND() LIMIT :limit")
    List<WordDetail> findRandomDistractors(@Param("limit") int limit);

    /* CrossWordPuzzle 용 */
    @Query(value = "SELECT wd FROM WordDetail wd " +
                  "JOIN FETCH wd.word w " +
                  "WHERE CHAR_LENGTH(w.content) <= :maxLength " +
                  "AND w.content NOT LIKE '% %' " +
                  "ORDER BY RAND() LIMIT :limit")
    List<WordDetail> findRandomWordsForCrossword(@Param("maxLength") int maxLength,
                                                 @Param("limit") int limit);
}
