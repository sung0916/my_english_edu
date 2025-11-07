package com.englishapp.api_server.repository;

import com.englishapp.api_server.entity.Word;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WordRepository extends JpaRepository<Word, Long> {

    List<Word> findByAudioUrlIsNull();
}
