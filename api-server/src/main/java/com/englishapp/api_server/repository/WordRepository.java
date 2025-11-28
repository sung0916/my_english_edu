package com.englishapp.api_server.repository;

import com.englishapp.api_server.entity.Word;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WordRepository extends JpaRepository<Word, Long> {

    List<Word> findByAudioUrlIsNull();

    /* FallingWords 단어 랜덤으로 가져오기 */
    // MySQL의 "ORDER BY RAND()"를 사용하여 랜덤 추출
    @Query(value = "SELECT * FROM words w " +
            "WHERE w.type = 'WORD' " +
            "ORDER BY RAND() LIMIT :limit", nativeQuery = true)
    List<Word> findRandomWords(@Param("limit") int limit);

    /* FallingWords 게임 난이도별 단어 찾기 */
    // 1단계 - 공백 없음, 길이 7이하, 랜덤N개
    @Query(value = "SELECT * FROM words w " +
            "WHERE w.type = 'WORD' " +
            "AND w.content NOT LIKE '% %' " +
            "AND CHAR_LENGTH(w.content) <= 7 " +
            "ORDER BY RAND() LIMIT :limit", nativeQuery = true)
    List<Word> findWordsForLevel1(@Param("limit") int limit);

    // 2단계 - 공백 없음, 길이 10이하, 랜덤 N개
    @Query(value = "SELECT * FROM words w " +
            "WHERE w.type = 'WORD' " +
            "AND w.content NOT LIKE '% %' " +
            "AND CHAR_LENGTH(w.content) <= 10 " +
            "ORDER BY RAND() LIMIT :limit", nativeQuery = true)
    List<Word> findWordsForLevel2(@Param("limit") int limit);

    // 3, 4, 5단계 - 제한 없음, 랜덤 N개
    @Query(value = "SELECT * FROM words w " +
            "WHERE w.type = 'WORD' " +
            "ORDER BY RAND() LIMIT :limit", nativeQuery = true)
    List<Word> findWordsAny(@Param("limit") int limit);
}
