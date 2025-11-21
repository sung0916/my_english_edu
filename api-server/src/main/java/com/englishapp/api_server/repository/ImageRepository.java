package com.englishapp.api_server.repository;

import com.englishapp.api_server.domain.ImageStatus;
import com.englishapp.api_server.domain.ImageType;
import com.englishapp.api_server.entity.Image;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ImageRepository extends JpaRepository<Image, Long> {

    // 스케줄러에서 사용할 쿼리 메서드
    List<Image> findByStatusAndCreatedAtBefore(ImageStatus status, LocalDateTime cutoff);

    // 이미지 등록
    List<Image> findByTypeAndRelatedIdAndStatus(ImageType imageType, Long id, ImageStatus imageStatus);

    // relatedId를 통해 이미지 찾기
    List<Image> findByTypeAndRelatedId(ImageType type, Long relatedId);

    // 타입과 관련 ID를 기준으로 정렬 순서가 가장 빠른 첫번째 이미지 조회(썸네일용)
    Optional<Image> findFirstByTypeAndRelatedIdOrderBySortOrderAsc(ImageType type, Long relatedId);
}
