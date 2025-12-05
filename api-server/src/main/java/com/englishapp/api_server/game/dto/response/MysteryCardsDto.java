package com.englishapp.api_server.game.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class MysteryCardsDto {

    private Long questionId;        // 문제 고유 ID(프론트 key용)
    private String sentence;        // 문제 (WordDetails의 description)
    private String answerWord;      // 정답인 단어
    private String answerImageUrl;  // 정답인 이미지 URL(결과 확인용)

    private List<CardOption> options;  // 4지선다 보기

    @Getter
    @Builder
    public static class CardOption {

        private Long wordId;
        private String word;        // 카드 앞면 (텍스트)
        private String imageUrl;    // 카드 뒷면 (이미지)
        @JsonProperty("isAnswer")   // 프론트에서 is가 생략되지 않고, isAnswer로 받기위해 적용
        private boolean isAnswer;   // 정답여부
    }
}
