package com.englishapp.api_server.service.impl;

import com.englishapp.api_server.config.jwt.JwtUtil;
import com.englishapp.api_server.dto.response.LoginResponse;
import com.englishapp.api_server.dto.response.UserResponse;
import com.englishapp.api_server.entity.User;
import com.englishapp.api_server.repository.UserRepository;
import com.englishapp.api_server.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @Override
    @Transactional(readOnly = true)  // 성능 최적화
    public LoginResponse login(String loginId, String password) {

        // 1. 사용자 ID로 유저 조회
        User user = userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다.")); // TODO: 좀 더 구체적인 예외 처리 권장

        // 2. 비밀번호 일치 여부 확인
        // TODO: 실제 프로젝트에서는 반드시 PasswordEncoder를 사용하여 암호화된 비밀번호를 비교해야 합니다.
        // if (!passwordEncoder.matches(password, user.getPassword())) {
        //     throw new RuntimeException("비밀번호가 일치하지 않습니다.");
        // }
        if (!user.getPassword().equals(password)) {
            throw new RuntimeException("비밀번호가 일치하지 않습니다.");
        }

        // 3. JWT 생성
        // 예시: user.getRole()을 통해 사용자의 권한을 가져와 토큰에 포함
        String token = jwtUtil.createToken(user.getLoginId(), user.getRole());

        // 4. 응답 DTO 생성
        return new LoginResponse(token, new UserResponse(user));
    }
}