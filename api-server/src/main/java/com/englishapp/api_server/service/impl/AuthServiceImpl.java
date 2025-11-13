package com.englishapp.api_server.service.impl;

import com.englishapp.api_server.config.jwt.JwtUtil;
import com.englishapp.api_server.domain.UserStatus;
import com.englishapp.api_server.dto.response.LoginResponse;
import com.englishapp.api_server.dto.response.UserResponse;
import com.englishapp.api_server.entity.User;
import com.englishapp.api_server.repository.UserRepository;
import com.englishapp.api_server.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)  // 성능 최적화
    public LoginResponse login(String loginId, String password) {

        // 사용자 ID로 유저 조회
        User user = userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new RuntimeException("아이디 또는 비밀번호가 일치하지 않습니다."));

        // 비밀번호 일치 여부 확인
         if (!passwordEncoder.matches(password, user.getPassword())) {
             throw new RuntimeException("비밀번호가 일치하지 않습니다.");
         }

         // 계정 상태 확인
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new RuntimeException("승인이 필요하거나 비활성화된 계정입니다.");
        }

        String token = jwtUtil.createToken(user.getId(), user.getLoginId(), user.getRole());
        return new LoginResponse(token, new UserResponse(user));
    }
}