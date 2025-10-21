package com.englishapp.api_server.controller;

import com.englishapp.api_server.dto.request.LoginRequest;
import com.englishapp.api_server.dto.response.LoginResponse;
import com.englishapp.api_server.entity.User;
import com.englishapp.api_server.repository.UserRepository;
import com.englishapp.api_server.service.AuthService;
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

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest) {

        LoginResponse response = authService.login(loginRequest.getLoginId(), loginRequest.getPassword());
        return ResponseEntity.ok(response);
    }
}