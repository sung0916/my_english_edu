package com.englishapp.api_server.service.impl;

import com.englishapp.api_server.domain.UserRole;
import com.englishapp.api_server.domain.UserStatus;
import com.englishapp.api_server.dto.request.UserRequest;
import com.englishapp.api_server.dto.response.UserResponse;
import com.englishapp.api_server.entity.User;
import com.englishapp.api_server.repository.UserRepository;
import com.englishapp.api_server.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
@Builder
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // 가입 요청
    @Override
    @Transactional
    public UserResponse signup(UserRequest request) {

        // ID 중복 검사
        if (userRepository.findByLoginId(request.getLoginId()).isPresent()) {
            throw new IllegalArgumentException("이미 사용 중인 아이디입니다.");
        }

        User newUser = User.builder()
                .username(request.getUsername())
                .loginId(request.getLoginId())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .tel(request.getTel())
                .role(UserRole.STUDENT)
                .status(UserStatus.PENDING)
                .build();

        User savedUser = userRepository.save(newUser);
        return new UserResponse(savedUser);
    }

    // 정보 수정
    @Override
    public UserResponse updateUser(Long userId, UserRequest userRequest) {
        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("유저가 존재하지 않습니다 : " + userId));

        if (userRequest.getPassword() != null && !userRequest.getPassword().isEmpty()) {
            String encodedPassword = passwordEncoder.encode(userRequest.getPassword());
            existingUser.updatePassword(encodedPassword);
        }
        if (userRequest.getEmail() != null) {
            existingUser.updateEmail(userRequest.getEmail());
        }
        if (userRequest.getTel() != null) {
            existingUser.updateTel(userRequest.getTel());
        }
        return new UserResponse(existingUser);
    }

    // 프로필 조회
    @Override
    @Transactional(readOnly = true)
    public UserResponse findMyProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다."));

        return new UserResponse(user);
    }

    // 회원 탈퇴
    @Override
    @Transactional
    public void withdraw(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다."));

        if (user.getStatus() == UserStatus.DELETED) {
            throw new IllegalStateException("이미 탈퇴한 사용자입니다.");
        }

        // User Entity에게 탈퇴 처리를 위임
        user.withdraw();
    }
}