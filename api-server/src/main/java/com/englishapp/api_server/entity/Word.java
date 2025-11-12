package com.englishapp.api_server.entity;

import com.englishapp.api_server.domain.AudibleContent;
import com.englishapp.api_server.domain.EnglishType;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "words")
@Getter
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Word implements AudibleContent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "word_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "place_id", nullable = false)
    private Place place;

    @Column(nullable = false)
    private String content;

    @Column(nullable = false)
    private String meaning;

    @Enumerated(EnumType.STRING)
    private EnglishType type;

    @Column(name = "audio_url")
    private String audioUrl;

    @Override
    public void updateAudioUrl(String audioUrl) {
        this.audioUrl = audioUrl;
    }
}
