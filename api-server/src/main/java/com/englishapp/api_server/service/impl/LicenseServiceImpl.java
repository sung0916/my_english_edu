package com.englishapp.api_server.service.impl;

import com.englishapp.api_server.dto.response.LicenseResponse;
import com.englishapp.api_server.entity.StudentLicense;
import com.englishapp.api_server.entity.User;
import com.englishapp.api_server.repository.StudentLicenseRepository;
import com.englishapp.api_server.repository.SubscriptionRepository;
import com.englishapp.api_server.service.LicenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class LicenseServiceImpl implements LicenseService {

    private final StudentLicenseRepository licenseRepository;
    private final SubscriptionRepository subscriptionRepository;

    // 학생용 : 수강 시작
    @Override
    public void startLicense(User user, Long licenseId, LocalDate startDate) {
        StudentLicense license = licenseRepository.findById(licenseId)
                .orElseThrow(() -> new IllegalArgumentException("라이선스 없음"));

        // 본인 확인
        if (!license.getStudent().getId().equals(user.getId())) {
            throw new AccessDeniedException("본인의 수강권만 시작할 수 있습니다.");
        }
        license.activate(startDate);
    }

    // 관리자 : 일시 정지
    @Override
    public void pauseLicense(Long licenseId) {
        StudentLicense license = licenseRepository.findById(licenseId)
                .orElseThrow(() -> new IllegalArgumentException("라이선스 없음"));
        license.pause();
    }

    // 관리자 : 재시작
    @Override
    public void resumeLicense(Long licenseId) {
        StudentLicense license = licenseRepository.findById(licenseId)
                .orElseThrow(() -> new IllegalArgumentException("라이선스 없음"));
        license.resume();
    }

    @Override
    @Transactional(readOnly = true)
    public List<LicenseResponse> getMyLicenses(User user) {

        // 1. 내 라이선스 조회
        List<StudentLicense> licenses = licenseRepository.findByStudentIdOrderByIdDesc(user.getId());

        // 2. DTO 변환
        return licenses.stream().map(license -> {
            LicenseResponse response = LicenseResponse.from(license);

            // 3. 상품명 조회 (Subscription -> Product -> Name)
            // TODO: 추후 성능 최적화를 위해 Fetch Join 쿼리 사용으로 수정
            subscriptionRepository.findById(license.getSubscriptionId())
                    .ifPresent(sub -> response.setProductName(sub.getProduct().getProductName()));
            return response;
        }).collect(Collectors.toList());
    }
}
