package com.englishapp.api_server.service.impl;

import com.englishapp.api_server.domain.UserRole;
import com.englishapp.api_server.domain.UserStatus;
import com.englishapp.api_server.dto.response.AdminSignupPermitResponse;
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
    public List<AdminSignupPermitResponse> findPendingUsers() {
        return userRepository.findByStatus(UserStatus.PENDING).stream()
                .map(AdminSignupPermitResponse::new)
                .collect(Collectors.toList());
    }

    // 가입 허가
    @Override
    @Transactional
    public UserResponse approveUser(Long userId, UserRole role) {
        // 1. 엔티티를 찾아온다.
        User user = findUserById(userId); // 또는 userRepository.findById(...)

        // 2. 엔티티에게 승인 처리를 위임한다.
        user.approve(role);

        // @Transactional에 의해 변경된 상태가 자동으로 DB에 반영됩니다.
        // UserResponse는 생성 시점에 변경된 user의 최신 상태를 담게 됩니다.
        return new UserResponse(user);
    }

    @Override
    @Transactional
    public void deleteUser(Long userId) {
        // 1. 엔티티를 찾아온다.
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다."));

        // 2. 엔티티에게 삭제 처리를 위임한다.
        user.deleteByAdmin();
    }

    @Override
    public List<UserResponse> findAllUsers() {
        return List.of();
    }

    // 회원 검색
    @Override
    public User findUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("'" +userId + "'를 찾지 못했습니다."));
    }
}
