package com.englishapp.api_server.service;

import com.englishapp.api_server.dto.response.LoginResponse;

public interface AuthService {

    LoginResponse login(String loginId, String password);
}