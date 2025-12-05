package com.englishapp.api_server.game.service.impl;

import com.englishapp.api_server.entity.WordDetail;
import com.englishapp.api_server.game.dto.response.FallingWordsDto;
import com.englishapp.api_server.entity.Word;
import com.englishapp.api_server.game.domain.GameLevel;
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

import java.util.*;
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

        int timeLimit = 0;  // 게임별, 레벨별 시간 제한 담을 변수

        // 2. 게임 종류에 따른 데이터 조회
        switch (game.getGameName()) {
            case FALLINGWORDS:
                dataItems = getFallingWordsData(level);
                // timeLimit = 0;  // 프론트에서 속도 제어
                break;
            case MYSTERYCARDS:
                timeLimit = getMysteryTimeLimit(level);
                dataItems = getMysteryCardsData(level);
                break;
            default:
                throw new IllegalArgumentException("지원하지 않는 게임: " + game.getGameName());
        }

        // 3. 최종 응답 포장
        return GameContentResponse.builder()
                .gameType(game.getGameName().name())
                .level(level.name())
                .timeLimit(timeLimit)
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

    // MysteryCards 레벨별 시간 설정
    private int getMysteryTimeLimit(GameLevel level) {
        switch (level) {
            case FIRST: return 10;
            case SECOND: return 10;
            case THIRD: return 7;
            default: return 10;
        }
    }

    // MysteryCards 전용 로직
    private List<Object> getMysteryCardsData(GameLevel level) {
        int questionCount;  // 레벨에 따라 조정

        // 레벨 별 문제 수 설정
        switch (level) {
            case FIRST: questionCount = 10; break;
            case SECOND: questionCount = 15; break;
            case THIRD: questionCount = 20; break;
            default: questionCount = 10;
        }

        // 1. 문제(정답) 데이터 조회 - 중복 제거를 위해 3배수 조회
        List<WordDetail> questions = wordDetailRepository.findRandomQuestions(questionCount * 3);

        // 2. 오답(보기) 데이터 조회 (넉넉하게 문제 수 * 3)
        List<WordDetail> distractors = wordDetailRepository.findRandomDistractors(questionCount * 5);

        // 3. 문제 중복 제거 로직 (Set 활용)
        List<WordDetail> uniqueQuestions = new ArrayList<>();
        Set<String> usedContents = new HashSet<>();

        for (WordDetail wd : questions) {
            String content = wd.getWord().getContent();
            if (usedContents.contains(content)) continue;  // 이미 뽑은 단어면 패스
            uniqueQuestions.add(wd);
            usedContents.add(content);
            if (uniqueQuestions.size() == questionCount) break;  // 목표 갯수 달성 시 중단
        }

        // 4. 최종 DTO 생성
        List<Object> resultList = new ArrayList<>();
        int distIndex = 0;

        for (WordDetail question : uniqueQuestions) {
            // A. 보기 리스트 구성 (정답 1개 + 오답 3개)
            List<MysteryCardsDto.CardOption> options = new ArrayList<>();
            String answerContent = question.getWord().getContent();

            // 정답 보기 추가
            options.add(MysteryCardsDto.CardOption.builder()
                    .wordId(question.getWord().getId())
                    .word(answerContent)
                    .imageUrl(question.getImageUrl())
                    .isAnswer(true)
                    .build());

            // B. 오답 3개 추가
            int addedDistractors = 0;
            while (addedDistractors < 3) {
                if (distIndex >= distractors.size()) distIndex = 0;
                WordDetail wrong = distractors.get(distIndex++);
                String wrongContent = wrong.getWord().getContent();

                // 정답과 같거나, 이미 보기에 있는 단어면 패스
                boolean isDuplicate =
                        wrongContent.equals(answerContent) || options.stream().anyMatch(opt -> opt.getWord().equals(wrongContent));

                if (isDuplicate) continue;

                options.add(MysteryCardsDto.CardOption.builder()
                                .wordId(wrong.getWord().getId())
                                .word(wrongContent)
                                .imageUrl(wrong.getImageUrl())
                                .isAnswer(false)
                        .build());

                addedDistractors++;
            }

            // 보기 섞기
            Collections.shuffle(options);

            // C. DTO 생성 및 추가
            // 주의: resultList.add는 반복문(오답생성) 밖에서 한번만 해야함
            resultList.add(MysteryCardsDto.builder()
                            .questionId(question.getWord().getId())
                            .sentence(question.getDescription())
                            .answerWord(answerContent)
                            .answerImageUrl(question.getImageUrl())
                            .options(options)
                    .build());
        }
        return resultList;
    }
}
