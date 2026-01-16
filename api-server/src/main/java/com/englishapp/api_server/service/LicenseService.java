package com.englishapp.api_server.service;

import com.englishapp.api_server.dto.response.LicenseResponse;
import com.englishapp.api_server.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

public interface LicenseService {

    // 학생용
    void startLicense(User user, Long licenseId, LocalDate startDate);

    // 주문 아이템 ID로 시작 (주문 상세페이지용)
    void startLicenseByOrderItem(User user, Long orderItemId, LocalDate startDate);

    // 내 수강권 목록 조회
    @Transactional(readOnly = true)
    Page<LicenseResponse> getMyLicenses(User user, Pageable pageable);

    // 관리자용
    void pauseLicense(User user, Long licenseId);

    // 관리자용
    void resumeLicense(User user, Long licenseId);
}
