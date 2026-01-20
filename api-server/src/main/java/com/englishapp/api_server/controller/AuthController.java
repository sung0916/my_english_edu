package com.englishapp.api_server.controller;

import com.englishapp.api_server.dto.request.LoginRequest;
import com.englishapp.api_server.dto.response.LoginResponse;
import com.englishapp.api_server.entity.User;
import com.englishapp.api_server.repository.UserRepository;
import com.englishapp.api_server.service.AuthService;
import com.englishapp.api_server.service.UserService;
import com.englishapp.api_server.service.impl.UserDetailsImpl;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest) {

        LoginResponse response = authService.login(loginRequest.getLoginId(), loginRequest.getPassword());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/confirm-password")
    public ResponseEntity<Void> confirmPassword(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody ConfirmPasswordRequest request
            ) {

        String loginId = userDetails.getUsername();

        User user = userService.findUserByLoginId(loginId);

        // 현재 사용자의 정보
        String currentHashedPassword = user.getPassword();

        // 입력된 비밀번호와 저장된 비밀번호 비교
        if (passwordEncoder.matches(request.getPassword(), currentHashedPassword)) {
            // 비밀번호 일치
            return ResponseEntity.ok().build();
        } else {
            // 비밀번호 불일치
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @Getter
    public static class ConfirmPasswordRequest {
        private String password;
    }
}
