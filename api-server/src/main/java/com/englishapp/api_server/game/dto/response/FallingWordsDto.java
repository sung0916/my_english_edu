package com.englishapp.api_server.game.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FallingWordsDto {
    private Long id;
    private String content;
    private String meaning;
    private String audioUrl;
}
