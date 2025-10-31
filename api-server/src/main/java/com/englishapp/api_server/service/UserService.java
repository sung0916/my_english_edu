package com.englishapp.api_server.service;

import com.englishapp.api_server.dto.request.UserRequest;
import com.englishapp.api_server.dto.response.UserResponse;
import com.englishapp.api_server.entity.User;

import java.util.List;

public interface UserService {

    // 가입 요청
    UserResponse signup(UserRequest request);

    // 회원 수정
    UserResponse updateUser(Long userId, UserRequest userRequest);

    // 프로필 조회
    UserResponse findMyProfile(Long userId);

    // 회원 탈퇴
    void withdraw(Long userId);
}