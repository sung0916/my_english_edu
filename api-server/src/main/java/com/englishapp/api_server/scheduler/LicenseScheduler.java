package com.englishapp.api_server.scheduler;

import com.englishapp.api_server.repository.StudentLicenseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class LicenseScheduler {

    private final StudentLicenseRepository licenseRepository;

    // 매일 자정(00:00:00)에 실행
    // cron 표현식: "초 분 시 일 월 요일"
    public void expireLicenses() {
        LocalDateTime now = LocalDateTime.now();
        log.info("스케줄러 실행: 만료된 수강권 정리 시작 (기준 시각: {})", now);
        int updatedCount = licenseRepository.bulkExpireLicenses(now);
        if (updatedCount > 0) {
            log.info("총 {}건의 수강권 만료 처리 완료", updatedCount);
        } else {
            log.info("만료 대상 수강권이 없습니다.");
        }
    }
}
