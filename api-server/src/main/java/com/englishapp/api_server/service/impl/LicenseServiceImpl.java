package com.englishapp.api_server.service.impl;

import com.englishapp.api_server.domain.LicenseStatus;
import com.englishapp.api_server.dto.response.LicenseResponse;
import com.englishapp.api_server.entity.OrderItem;
import com.englishapp.api_server.entity.StudentLicense;
import com.englishapp.api_server.entity.User;
import com.englishapp.api_server.repository.OrderItemRepository;
import com.englishapp.api_server.repository.StudentLicenseRepository;
import com.englishapp.api_server.repository.SubscriptionRepository;
import com.englishapp.api_server.service.LicenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Transactional
public class LicenseServiceImpl implements LicenseService {

    private final StudentLicenseRepository licenseRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final OrderItemRepository orderItemRepository;

    // 학생용 : 수강 시작
    @Override
    public void startLicense(User user, Long licenseId, LocalDate startDate) {
        StudentLicense license = licenseRepository.findById(licenseId)
                .orElseThrow(() -> new IllegalArgumentException("라이선스 없음"));

        // 본인 확인
        if (!license.getStudent().getId().equals(user.getId())) {
            throw new AccessDeniedException("본인의 수강권만 시작할 수 있습니다.");
        }
        validateOwnerOrAdmin(user, license);
        license.activate(startDate);
    }

    // 주문 아이템 ID로 시작 (주문 상세페이지용)
    @Override
    public void startLicenseByOrderItem(User user, Long orderItemId, LocalDate startDate) {
        // 주문 아이템에서 상품 ID 찾기
        OrderItem orderItem = orderItemRepository.findById(orderItemId)
                .orElseThrow(() -> new IllegalArgumentException("주문 상품 정보 없음"));
        Long productId = orderItem.getProduct().getId();

        // 유저가 가진 해당 상품의 Pending 라이선스 중 하나를 가져옴
        StudentLicense license = licenseRepository.findFirstByStudentIdAndSubscription_Product_IdAndStatus(
                user.getId(), productId, LicenseStatus.PENDING
        ).orElseThrow(() -> new IllegalStateException("활성화 가능한 수강권이 없음"));

        license.activate(startDate);
    }

    // 마이페이지 내 수강목록 조회
    @Transactional(readOnly = true)
    @Override
    public Page<LicenseResponse> getMyLicenses(User user, Pageable pageable) {

        // Repository에서 Page로 받아옴
        Page<StudentLicense> licensePage = licenseRepository.findAllByStudentIdWithDetails(user.getId(), pageable);

        // Page.map을 이용해 DTO로 변환
        return licensePage.map(LicenseResponse::from);
    }

    // 학생 or 관리자 : 일시 정지
    @Override
    public void pauseLicense(User user, Long licenseId) {
        StudentLicense license = licenseRepository.findById(licenseId)
                .orElseThrow(() -> new IllegalArgumentException("라이선스 없음"));

        // 소유권 검증 (관리자는 통과)
        validateOwnerOrAdmin(user, license);
        license.pause(); // Entity 내부 로직 실행
    }

    // 학생 or 관리자 : 재시작
    @Override
    public void resumeLicense(User user, Long licenseId) {
        StudentLicense license = licenseRepository.findById(licenseId)
                .orElseThrow(() -> new IllegalArgumentException("라이선스 없음"));

        // 소유권 검증
        validateOwnerOrAdmin(user, license);
        license.resume(); // Entity 내부 로직 실행
    }

    private void validateOwnerOrAdmin(User user, StudentLicense license) {
        boolean isOwner = license.getStudent().getId().equals(user.getId());
        boolean isAdmin = user.getRole().name().equals("ADMIN"); // Role Enum 확인 필요

        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException("본인의 수강권만 관리할 수 있습니다.");
        }
    }
}
