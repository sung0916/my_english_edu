package com.englishapp.api_server.controller;

import com.englishapp.api_server.dto.request.ApproveUserRequest;
import com.englishapp.api_server.dto.response.AdminSignupPermitResponse;
import com.englishapp.api_server.dto.response.UserResponse;
import com.englishapp.api_server.entity.User;
import com.englishapp.api_server.repository.UserRepository;
import com.englishapp.api_server.service.AdminService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

    // 승인 대기 목록 조회
    @GetMapping("/pending")
    public ResponseEntity<List<AdminSignupPermitResponse>> getPendingUsers() {

        List<AdminSignupPermitResponse> pendingUsers = adminService.findPendingUsers();
        return ResponseEntity.ok(pendingUsers);
    }

    // 가입 승인
    @PatchMapping("/{userId}/approve")
    public ResponseEntity<UserResponse> approveUser(
            @PathVariable int userId,
            @RequestBody ApproveUserRequest request) {

        UserResponse approvedUser = adminService.approveUser(userId, request.getRole());
        return ResponseEntity.ok(approvedUser);
    }

    // 회원 삭제
    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable int userId) {

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
    public ResponseEntity<User> getUserById(@PathVariable int userId) {
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
}