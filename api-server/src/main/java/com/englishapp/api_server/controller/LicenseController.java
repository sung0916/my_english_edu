package com.englishapp.api_server.controller;

import com.englishapp.api_server.dto.request.LicenseRequest;
import com.englishapp.api_server.dto.response.LicenseResponse;
import com.englishapp.api_server.service.LicenseService;
import com.englishapp.api_server.service.impl.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/licenses")
@RequiredArgsConstructor
public class LicenseController {

    private final LicenseService licenseService;

    // 수강권 목록 조회
    @GetMapping("/my")
    public ResponseEntity<List<LicenseResponse>> getMyLicenses(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        List<LicenseResponse> responses =
                licenseService.getMyLicenses(userDetails.getUser());
        return ResponseEntity.ok(responses);
    }

    // 수강 시작하기 (학생용)
    @PatchMapping("/{licenseId}/start")
    public ResponseEntity<String> startLicense(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long licenseId,
            @RequestBody LicenseRequest request) {

        licenseService.startLicense(userDetails.getUser(), licenseId, request.getStartDate());
        return ResponseEntity.ok("수강이 시작되었습니다.");
    }

    // 일시정지 (관리자용)
    @PatchMapping("/{licenseId}/pause")
    public ResponseEntity<String> pauseLicense(@PathVariable Long licenseId) {

        licenseService.pauseLicense(licenseId);
        return ResponseEntity.ok("일시정지 되었습니다.");
    }

    // 재시작 (관리자용)
    @PatchMapping("/{licenseId}/resume")
    public ResponseEntity<String> resumeLicense(@PathVariable Long licenseId) {

        licenseService.resumeLicense(licenseId);
        return ResponseEntity.ok("재시작 되었습니다.");
    }
}
