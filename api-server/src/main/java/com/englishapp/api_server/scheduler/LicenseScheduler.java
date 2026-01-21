package com.englishapp.api_server.scheduler;

import com.englishapp.api_server.repository.StudentLicenseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class LicenseScheduler {

    private final StudentLicenseRepository licenseRepository;

    // "매 시간" 실행 (글로벌 대응)
    // cron 표현식: "초 분 시 일 월 요일"
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void expireLicenses() {
        OffsetDateTime now = OffsetDateTime.now();
        log.info("스케줄러 실행: 만료된 수강권 정리 (UTC 기준: {})", now);
        int updatedCount = licenseRepository.bulkExpireLicenses(now);
        log.info("총 {}건의 수강권 만료 처리 완료", updatedCount);
    }
}
