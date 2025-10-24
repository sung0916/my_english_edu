package com.englishapp.api_server.service;

import com.englishapp.api_server.domain.UserRole;
import com.englishapp.api_server.dto.response.UserResponse;
import com.englishapp.api_server.entity.User;

import java.util.List;

public interface AdminService {

    // 승인 대기 목록
    List<UserResponse> findPendingUsers();

    // 가입 허가
    UserResponse approveUser(int userId, UserRole role);

    // 회원 삭제
    void deleteUser(int userId);

    // 회원 목록
    List<UserResponse> findAllUsers();

    // 회원 검색
    User findUserById(int userId);
}
