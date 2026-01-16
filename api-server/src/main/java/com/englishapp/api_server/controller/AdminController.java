package com.englishapp.api_server.controller;

import com.englishapp.api_server.domain.OrderStatus;
import com.englishapp.api_server.domain.ProductType;
import com.englishapp.api_server.dto.request.ApproveUserRequest;
import com.englishapp.api_server.dto.response.AdminOrderDto;
import com.englishapp.api_server.dto.response.AdminSignupPermitResponse;
import com.englishapp.api_server.dto.response.UserResponse;
import com.englishapp.api_server.entity.User;
import com.englishapp.api_server.repository.UserRepository;
import com.englishapp.api_server.service.AdminService;
import com.englishapp.api_server.service.OrderService;
import com.englishapp.api_server.service.PaymentService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final UserRepository userRepository;
    private final PaymentService paymentService;
    private final OrderService orderService;

    // 승인 대기 목록 조회
    @GetMapping("/pending")
    public ResponseEntity<List<AdminSignupPermitResponse>> getPendingUsers() {

        List<AdminSignupPermitResponse> pendingUsers = adminService.findPendingUsers();
        return ResponseEntity.ok(pendingUsers);
    }

    // 가입 승인
    @PatchMapping("/{userId}/approve")
    public ResponseEntity<UserResponse> approveUser(
            @PathVariable Long userId,
            @RequestBody ApproveUserRequest request) {

        UserResponse approvedUser = adminService.approveUser(userId, request.getRole());
        return ResponseEntity.ok(approvedUser);
    }

    // 회원 삭제
    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long userId) {

        adminService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }

    // 전체 회원 검색
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }

    // 특정 회원 검색
    @GetMapping("/{userId}")
    public ResponseEntity<User> getUserById(@PathVariable Long userId) {
        User user = adminService.findUserById(userId);
        try {
            return ResponseEntity.ok(user);
        } catch (EntityNotFoundException e) {
            log.error("사용자를 찾을 수 없습니다. ID: {}", userId, e);
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .build();
        } catch (Exception e) {
            log.error("예상치 못한 에러 발생. ID: {}", userId, e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .build();
        }
    }

    // 관리자용 상품 주문 목록 조회
    @GetMapping("/orders")
    public ResponseEntity<Page<AdminOrderDto>> getOrders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) ProductType type, // ITEM, SUBSCRIPTION
            @PageableDefault(sort = "orderedAt", direction = Sort.Direction.DESC, size = 10) Pageable pageable
    ) {
        Page<AdminOrderDto> result = orderService.getAdminOrders(status, type, pageable);
        return ResponseEntity.ok(result);
    }

    // 환불 승인 (결제 취소)
    @PostMapping("/payments/{orderId}/refund-approve")
    public ResponseEntity<String> approveRefund(@PathVariable Long orderId) {
        paymentService.processRefund(orderId, "관리자 승인(Admin Page)");
        return ResponseEntity.ok("환불 처리가 완료되었습니다.");
    }
}
