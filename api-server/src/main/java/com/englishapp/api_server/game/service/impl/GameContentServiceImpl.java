package com.englishapp.api_server.game.service.impl;

import com.englishapp.api_server.entity.WordDetail;
import com.englishapp.api_server.game.dto.response.FallingWordsDto;
import com.englishapp.api_server.entity.Word;
import com.englishapp.api_server.game.domain.GameLevel;
import com.englishapp.api_server.game.domain.GameName;
import com.englishapp.api_server.game.dto.response.GameContentResponse;
import com.englishapp.api_server.game.dto.response.MysteryCardsDto;
import com.englishapp.api_server.game.entity.Game;
import com.englishapp.api_server.game.repository.GameRepository;
import com.englishapp.api_server.game.repository.WordDetailRepository;
import com.englishapp.api_server.game.service.GameContentService;
import com.englishapp.api_server.repository.SentenceRepository;
import com.englishapp.api_server.repository.WordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class GameContentServiceImpl implements GameContentService {

    private final GameRepository gameRepository;
    private final WordRepository wordRepository;
    private final SentenceRepository sentenceRepository;
    private final WordDetailRepository wordDetailRepository;

    // 메인 컨트롤 메서드 - 게임 ID에 따라 다른 데이터 리턴 (Factory 패턴과 유사)
    @Override
    @Transactional(readOnly = true)
    public GameContentResponse<?> getGameData(Long gameId, GameLevel level) {

        // 1. 무슨 게임인지 확인
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않은 게임"));

        List<Object> dataItems;

        // 2. 게임 종류에 따른 데이터 조회
        switch (game.getGameName()) {
            case FALLINGWORDS:
                dataItems = getFallingWordsData(level);
                break;
            case MYSTERYCARDS:
                dataItems = getMysteryCardsData(level);
                break;
            default:
                throw new IllegalArgumentException("지원하지 않는 게임: " + game.getGameName());
        }

        // 3. 최종 응답 포장
        return GameContentResponse.builder()
                .gameType(game.getGameName().name())
                .level(level.name())
                // .timeLimit(60)
                .items(dataItems)
                .build();
    }

    // FallingWords 전용 로직
    private List<Object> getFallingWordsData(GameLevel level) {

        // 1. 레벨 별 단어 조회
        List<Word> words = getFallingWordsByLevel(level);

        // 2. DTO 변환
        return words.stream()
                .map(word -> (Object) FallingWordsDto.builder()
                        .id(word.getId())
                        .content(word.getContent())
                        .meaning(word.getMeaning())
                        //.audioUrl(word.getAudioUrl())
                        .build())
                .collect(Collectors.toList());
    }

    // [헬퍼 로직 분리] 레벨별 단어 조회 쿼리 호출
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

    // MysteryCards 전용 로직
    private List<Object> getMysteryCardsData(GameLevel level) {
        int questionCount = 5;  // 레벨에 따라 조정

        // 1. 문제(정답) 데이터 조회
        List<WordDetail> questions = wordDetailRepository.findRandomQuestions(questionCount);

        // 2. 오답(보기) 데이터 조회 (넉넉하게 문제 수 * 3)
        List<WordDetail> distractors = wordDetailRepository.findRandomDistractors(questionCount);

        List<Object> resultList = new ArrayList<>();
        int distIndex = 0;

        for (WordDetail question : questions) {

            // A. 보기 리스트 구성 (정답 1개 + 오답 3개)
            List<MysteryCardsDto.CardOption> options = new ArrayList<>();

            // 정답 추가
            options.add(MysteryCardsDto.CardOption.builder()
                    .wordId(question.getWord().getId())
                    .word(question.getWord().getContent())
                    .imageUrl(question.getImageUrl())
                    .isAnswer(true)
                    .build());

            // 오답 3개 추가
            for (int i = 0; i < 3; i++) {
                if (distIndex >= distractors.size()) distIndex = 0;  // 인덱스 순환
                WordDetail wrong = distractors.get(distIndex++);

                // TODO: 추후 오답과 정답이 겹치는 경우 제외 로직 추가

                options.add(MysteryCardsDto.CardOption.builder()
                        .wordId(wrong.getWord().getId())
                        .word(wrong.getWord().getContent())
                        .imageUrl(wrong.getImageUrl())
                        .isAnswer(false)
                        .build());

                // 보기 섞기
                Collections.shuffle(options);

                // B. 문제 DTO 생성
                resultList.add(MysteryCardsDto.builder()
                        .questionId(question.getWord().getId())
                        .sentence(question.getDescription())
                        .answerWord(question.getWord().getContent())
                        .answerImageUrl(question.getImageUrl())
                        .options(options)
                        .build());
            }
        }
        return resultList;
    }
}
