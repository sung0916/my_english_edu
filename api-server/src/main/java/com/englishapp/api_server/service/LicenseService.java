package com.englishapp.api_server.service;

import com.englishapp.api_server.dto.response.LicenseResponse;
import com.englishapp.api_server.entity.User;

import java.time.LocalDate;
import java.util.List;

public interface LicenseService {

    // 학생용
    void startLicense(User user, Long licenseId, LocalDate startDate);

    // 관리자용
    void pauseLicense(Long licenseId);

    // 관리자용
    void resumeLicense(Long licenseId);

    // 내 수강권 목록 조회
    List<LicenseResponse> getMyLicenses(User user);
}
