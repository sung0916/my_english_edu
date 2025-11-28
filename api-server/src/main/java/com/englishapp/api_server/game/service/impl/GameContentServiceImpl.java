package com.englishapp.api_server.game.service.impl;

import com.englishapp.api_server.dto.WordDto;
import com.englishapp.api_server.entity.Word;
import com.englishapp.api_server.game.dto.GameLevel;
import com.englishapp.api_server.game.dto.GameName;
import com.englishapp.api_server.game.dto.response.GameContentResponse;
import com.englishapp.api_server.game.entity.Game;
import com.englishapp.api_server.game.repository.GameRepository;
import com.englishapp.api_server.game.service.GameContentService;
import com.englishapp.api_server.repository.SentenceRepository;
import com.englishapp.api_server.repository.WordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class GameContentServiceImpl implements GameContentService {

    private final GameRepository gameRepository;
    private final WordRepository wordRepository;
    private final SentenceRepository sentenceRepository;

    // 게임 ID에 따라 다른 데이터 리턴 (Factory 패턴과 유사)
    @Override
    public GameContentResponse<?> getGameData(Long gameId, GameLevel level) {

        // 1. 무슨 게임인지 확인
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않은 게임"));

        List<Object> dataItems;

        // 2. 게임 종류에 따른 데이터 조회
        if (game.getGameName() == GameName.FALLINGWORDS) {
            // 2-1. 엔티티 조회
            List<Word> words = getFallingWordsByLevel(level);

            // 2-2. 엔티티 -> DTO변환 (불필요한 DB 정보 노출 조심)
            dataItems = words.stream()
                    .map(word -> (Object) WordDto.builder()
                            .id(word.getId())
                            .content(word.getContent())
                            .meaning(word.getMeaning())
                            // .audioUrl(word.getAudioUrl())
                            .build())
                    .toList();  // Java 16 이하의 버전에선 ".collect(Collectors.toList())"로 사용

            // 2-3. 레벨별 시간 설정
            // timeLimit = getTimeLimitByLevel(level);

        } else {
            throw new IllegalArgumentException("유효하지 않은 게임");
        }

        // 3. 최종 응답 포장
        return GameContentResponse.builder()
                .gameType(game.getGameName().name())
                .level(level.name())
                // .timeLimit(60)
                .items(dataItems)
                .build();
    }

    // [로직 분리] 레벨별 단어 조회 쿼리 호출
    private List<Word> getFallingWordsByLevel(GameLevel level) {
        switch (level) {
            case FIRST:  return wordRepository.findWordsForLevel1(15);
            case SECOND: return wordRepository.findWordsForLevel2(20);
            case THIRD:  return wordRepository.findWordsAny(20);
            case FOURTH: return wordRepository.findWordsAny(25);
            case FIFTH:  return wordRepository.findWordsAny(30);
            default:     return wordRepository.findWordsForLevel1(15);
        }
    }

    // [로직 분리] 레벨별 제한시간 설정 (DB 없이 코드로 관리)
    private int getTimeLimitByLevel(GameLevel level) {
        switch (level) {
            case FIRST:  return 60; // 1단계는 60초
            case SECOND: return 50;
            case THIRD:  return 45;
            case FOURTH: return 40;
            case FIFTH:  return 30; // 5단계는 30초
            default:     return 60;
        }
    }

    // FallingWords 게임 전용 데이터 로직
    /*private List<Word> getFallingWordsData() {

        return wordRepository.findRandomWords(15);
    }*/

    // DB에서 gameId로 GameName Enum을 찾는 헬퍼 메서드
    /*public GameName getGameNameById(Long gameId) {

        return GameName.FALLINGWORDS;
    }*/

    // FallingWords 게임 레벨 별 메도드 호출
    /*public List<Word> getFallingWordsData(GameLevel level) {

        switch (level) {
            case FIRST:
                return wordRepository.findWordsForLevel1(15);
            case SECOND:
                return wordRepository.findWordsForLevel2(20);
            case THIRD:
                return wordRepository.findWordsAny(20);
            case FOURTH:
                return wordRepository.findWordsAny(25);
            case FIFTH:
                return wordRepository.findWordsAny(30);
            default:
                throw new IllegalArgumentException("Invalid Level");
        }
    }*/
}
