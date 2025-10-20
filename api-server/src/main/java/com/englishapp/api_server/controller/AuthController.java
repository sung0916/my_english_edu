package com.englishapp.api_server.controller;

import com.englishapp.api_server.dto.request.LoginRequest;
import com.englishapp.api_server.dto.response.LoginResponse;
import com.englishapp.api_server.entity.User;
import com.englishapp.api_server.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    // TODO: 실제 프로젝트에서는 JWT 토큰 생성 서비스와 비밀번호 암호화 서비스를 주입해야 합니다.
    // private final JwtTokenProvider jwtTokenProvider;
    // private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        // 1. 아이디로 사용자를 찾습니다.
        Optional<User> userOptional = userRepository.findByLoginId(loginRequest.getLoginId());

        if (userOptional.isEmpty()) {
            // 사용자가 존재하지 않는 경우
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "아이디 또는 비밀번호가 일치하지 않습니다."));
        }

        User user = userOptional.get();

        // 2. TODO: 비밀번호를 비교합니다. 실제로는 암호화된 비밀번호를 비교해야 합니다.
        // if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) { ... }
        if (!loginRequest.getPassword().equals(user.getPassword())) {
            // 비밀번호가 일치하지 않는 경우
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "아이디 또는 비밀번호가 일치하지 않습니다."));
        }

        // 3. TODO: 로그인이 성공하면 JWT 토큰을 생성합니다.
        // String token = jwtTokenProvider.createToken(user.getLoginId());
        String token = "sample-jwt-token-for-testing"; // 임시 테스트용 토큰

        // 4. 토큰과 사용자 정보를 응답으로 보냅니다.
        LoginResponse loginResponse = new LoginResponse(token, user);
        return ResponseEntity.ok(loginResponse);
    }
}
