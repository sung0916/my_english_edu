package com.englishapp.api_server.service.impl;

import com.englishapp.api_server.domain.UserRole;
import com.englishapp.api_server.domain.UserStatus;
import com.englishapp.api_server.dto.request.UserRequest;
import com.englishapp.api_server.dto.response.UserResponse;
import com.englishapp.api_server.entity.User;
import com.englishapp.api_server.repository.UserRepository;
import com.englishapp.api_server.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
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

        User newUser = new User();
        newUser.setUsername(request.getUsername());
        newUser.setLoginId(request.getLoginId());
        newUser.setPassword(passwordEncoder.encode(request.getPassword()));
        newUser.setEmail(request.getEmail());
        newUser.setTel(request.getTel());
        newUser.setRole(UserRole.STUDENT);
        newUser.setStatus(UserStatus.PENDING);

        User savedUser = userRepository.save(newUser);
        return new UserResponse(savedUser);
    }

    // 정보 수정
    @Override
    public UserResponse updateUser(int userId, UserRequest userRequest) {
        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("유저가 존재하지 않습니다 : " + userId));

        if (userRequest.getPassword() != null && !userRequest.getPassword().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(userRequest.getPassword()));
        }
        if (userRequest.getEmail() != null) {
            existingUser.setEmail(userRequest.getEmail());
        }
        if (userRequest.getTel() != null) {
            existingUser.setTel(userRequest.getTel());
        }
        return new UserResponse(existingUser);
    }

    // 프로필 조회
    @Override
    @Transactional(readOnly = true)
    public UserResponse findMyProfile(int userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다."));

        return new UserResponse(user);
    }

    // 회원 탈퇴
    @Override
    @Transactional
    public void withdraw(int userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다."));

        if (user.getStatus() == UserStatus.DELETED) {
            throw new IllegalStateException("이미 탈퇴한 사용자입니다.");
        }
        
        user.setStatus(UserStatus.DELETED);
        user.setEmail("삭제된 사용자");
        user.setTel("삭제된 사용자");
    }
}