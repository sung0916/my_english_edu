package com.englishapp.api_server.dto.response;

import com.englishapp.api_server.entity.User;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor // 모든 필드를 받는 생성자 추가
public class LoginResponse {
    private String token;
    private User user;
}
