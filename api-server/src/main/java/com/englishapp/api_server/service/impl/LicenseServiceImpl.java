package com.englishapp.api_server.service.impl;

import com.englishapp.api_server.domain.LicenseStatus;
import com.englishapp.api_server.domain.UserRole;
import com.englishapp.api_server.dto.response.LicenseResponse;
import com.englishapp.api_server.entity.OrderItem;
import com.englishapp.api_server.entity.StudentLicense;
import com.englishapp.api_server.entity.User;
import com.englishapp.api_server.repository.OrderItemRepository;
import com.englishapp.api_server.repository.StudentLicenseRepository;
import com.englishapp.api_server.service.LicenseService;
import com.englishapp.api_server.util.TimeUtils;
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

        // 유저 엔티티에 저장된 시간대를 전달
        String userTimezone = TimeUtils.resolvedTimezone(user);
        license.activate(startDate, userTimezone);
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

        String userTimezone = TimeUtils.resolvedTimezone(user);
        license.activate(startDate, userTimezone);
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

    // 학생 or 관리자 : 일시 정지 (낙관적 락 적용)
    @Override
    public void pauseLicense(User user, Long licenseId) {
        StudentLicense license = licenseRepository.findById(licenseId)
                .orElseThrow(() -> new IllegalArgumentException("라이선스 없음"));

        // 소유권 검증 (관리자는 통과)
        validateOwnerOrAdmin(user, license);

        // Entity 내부 로직 실행 - 낙관적 락 검사 (ObjectOptimisticLockingFailureException 발생)
        license.pause();
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
        // Role Enum 확인 (equals() 대신 == 사용으로 NPE 방지)
        boolean isAdmin = (user.getRole() == UserRole.ADMIN);

        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException("본인의 수강권만 관리할 수 있습니다.");
        }
    }
}
