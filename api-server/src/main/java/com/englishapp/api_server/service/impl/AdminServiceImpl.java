package com.englishapp.api_server.service.impl;

import com.englishapp.api_server.domain.UserStatus;
import com.englishapp.api_server.dto.response.UserResponse;
import com.englishapp.api_server.entity.User;
import com.englishapp.api_server.repository.UserRepository;
import com.englishapp.api_server.service.AdminService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;

    // 승인 대기 목록
    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> findPendingUsers() {
        return userRepository.findByStatus(UserStatus.PENDING).stream()
                .map(UserResponse::new)
                .collect(Collectors.toList());
    }

    // 가입 허가
    @Override
    @Transactional
    public UserResponse approveUser(int userId) {
        User user = findUserById(userId);

        // 활성화 중복 체크
        if (user.getStatus() == UserStatus.ACTIVE) {
            throw new IllegalStateException("이미 활성화된 사용자입니다.");
        }

        user.setStatus(UserStatus.ACTIVE);
        return new UserResponse(user);
    }

    @Override
    @Transactional
    public void deleteUser(int userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다."));

        if (user.getStatus() == UserStatus.DELETED) {
            throw new IllegalStateException("이미 탈퇴 처리된 사용자입니다.");
        }

        user.setStatus(UserStatus.DELETED);
        user.setEmail("삭제된 사용자");
        user.setTel("삭제된 사용자");
    }

    @Override
    public List<UserResponse> findAllUsers() {
        return List.of();
    }

    // 회원 검색
    @Override
    public User findUserById(int userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("'" +userId + "'를 찾지 못했습니다."));
    }
}
