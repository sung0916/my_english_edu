package com.englishapp.api_server.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class WordDto {
    private Long id;
    private String content;
    private String meaning;
    private String audioUrl;
}
