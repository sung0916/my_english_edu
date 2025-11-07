package com.englishapp.api_server.repository;

import com.englishapp.api_server.entity.Sentence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SentenceRepository extends JpaRepository<Sentence, Long> {

    List<Sentence> findByAudioUrlIsNull();
}
