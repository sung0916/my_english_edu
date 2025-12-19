package com.englishapp.api_server.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "places")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Builder
public class Place {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "place_id")
    private Long Id;

    @Column(name = "place_name", nullable = false)
    private String placeName;

    @OneToMany(mappedBy = "place", fetch = FetchType.LAZY)
    private List<Sentence> sentences = new ArrayList<>();

    @OneToMany(mappedBy = "place", fetch = FetchType.LAZY)
    private List<Word> words = new ArrayList<>();
}
