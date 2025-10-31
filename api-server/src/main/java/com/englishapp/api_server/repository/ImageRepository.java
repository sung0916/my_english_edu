package com.englishapp.api_server.repository;

import com.englishapp.api_server.domain.ImageStatus;
import com.englishapp.api_server.entity.Image;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ImageRepository extends JpaRepository<Image, Long> {

    // 스케줄러에서 사용할 쿼리 메서드
    List<Image> findByStatusAndCreatedAtBefore(ImageStatus status, LocalDateTime cutoff);
}
