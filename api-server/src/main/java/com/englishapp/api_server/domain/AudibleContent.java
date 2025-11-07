package com.englishapp.api_server.domain;

public interface AudibleContent {

    Long getId();

    String getContent();

    void updateAudioUrl(String audioUrl);
}
