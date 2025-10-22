package com.englishapp.api_server.controller;

import com.englishapp.api_server.dto.request.UserRequest;
import com.englishapp.api_server.dto.response.UserResponse;
import com.englishapp.api_server.entity.User;
import com.englishapp.api_server.service.UserService;
import com.englishapp.api_server.service.impl.UserDetailsImpl;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserService userService;

    // 가입 요청
    @PostMapping("/signup")
    public ResponseEntity<UserResponse> createUser(@RequestBody UserRequest request) {
        UserResponse savedUser = userService.signup(request);

        return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(savedUser);
    }

    // 회원 수정
    @PatchMapping(("/me"))
    public ResponseEntity<UserResponse> editUser(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody UserRequest request) {

        int currentUserId = userDetails.getUserId();
        UserResponse updatedUser = userService.updateUser(currentUserId, request);
        log.info("계정 수정 완료: {}", currentUserId);
        return ResponseEntity.ok(updatedUser);
    }

    // 프로필 조회
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMyProfile(@AuthenticationPrincipal UserDetailsImpl userDetails) {

        // userDetails 객체에서 사용자 ID 꺼내기
        int currentUserId = userDetails.getUserId();

        // 서비스 호출
        UserResponse myInfo = userService.findMyProfile(currentUserId);

        return ResponseEntity.ok(myInfo);
    }

    // 회원 탈퇴
    @DeleteMapping("/me")
    public ResponseEntity<Void> withdraw(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        int currentUserId = userDetails.getUserId();

        try {
            // UserDetailsImpl에서 현재 로그인한 사용자의 ID를 꺼냄

            userService.withdraw(currentUserId);
            log.info("삭제 완료 : {}", currentUserId);

            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            log.error("해당 계정이 없습니다. : {}", currentUserId, e);
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .build();
        } catch (Exception e) {
            log.error("예상치 못한 에러 : {}", currentUserId, e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .build();
        }
    }
}