package com.englishapp.api_server.controller;

import com.englishapp.api_server.dto.request.LicenseRequest;
import com.englishapp.api_server.dto.response.LicenseResponse;
import com.englishapp.api_server.service.LicenseService;
import com.englishapp.api_server.service.impl.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
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
    public ResponseEntity<Page<LicenseResponse>> getMyLicenses(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable
            ) {

        Page<LicenseResponse> responses = licenseService.getMyLicenses(userDetails.getUser(), pageable);
        return ResponseEntity.ok(responses);
    }

    // 주문 상세에서 호출하는 API (License ID를 모를 때)
    @PatchMapping("/start-by-item")
    public ResponseEntity<String> startByItem(
        @AuthenticationPrincipal UserDetailsImpl userDetails,
        @RequestBody LicenseRequest request
    ) {
        licenseService.startLicenseByOrderItem(userDetails.getUser(), request.getOrderItemId(), request.getStartDate());
        return ResponseEntity.ok("수강이 시작되었습니다.");
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

    // 일시정지 (본인, 관리자용)
    @PatchMapping("/{licenseId}/pause")
    public ResponseEntity<String> pauseLicense(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long licenseId) {

        licenseService.pauseLicense(userDetails.getUser(), licenseId);
        return ResponseEntity.ok("수강권이 일시정지 되었습니다.");
    }

    // 재시작 (본인, 관리자용)
    @PatchMapping("/{licenseId}/resume")
    public ResponseEntity<String> resumeLicense(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long licenseId) {

        licenseService.resumeLicense(userDetails.getUser(), licenseId);
        return ResponseEntity.ok("수강권이 다시 시작되었습니다.");
    }
}
