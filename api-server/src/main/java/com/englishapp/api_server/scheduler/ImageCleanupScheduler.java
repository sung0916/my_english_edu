package com.englishapp.api_server.scheduler;

import com.englishapp.api_server.domain.ImageStatus;
import com.englishapp.api_server.entity.Image;
import com.englishapp.api_server.repository.ImageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class ImageCleanupScheduler {

    private final ImageRepository imageRepository;

    @Scheduled(cron = "0 0 4 * * *")
    @Transactional
    public void cleanupPendingImages() {

        LocalDateTime cutoff = LocalDateTime.now().minusHours(24);

        List<Image> orphanImages = imageRepository.findByStatusAndCreatedAtBefore(ImageStatus.PENDING, cutoff);

        if (orphanImages.isEmpty()) {
            log.info("삭제할 임시 이미지가 없습니다.");
            return;
        }

        log.info("{}개의 임시 이미지를 삭제합니다.", orphanImages.size());

        for (Image image : orphanImages) {
            try {
                // 물리적 파일 삭제
                Path filePath = Paths.get(image.getImageUrl());
                Files.deleteIfExists(filePath);
                log.info("파일 삭제 성공: {}", image.getImageUrl());

                imageRepository.delete(image);

            } catch (IOException e) {
                log.error("파일 삭제 실패: {}", image.getImageUrl(), e);
            } catch (Exception e) {
                log.error("DB 기록 삭제 실패, Image ID: {}", image.getId(), e);
            }
        }
        log.info("임시 이미지 정리 스케줄러 완료.");
    }
}