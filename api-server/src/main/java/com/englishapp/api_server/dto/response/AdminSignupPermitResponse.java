package com.englishapp.api_server.dto.response;

import com.englishapp.api_server.domain.UserRole;
import com.englishapp.api_server.domain.UserStatus;
import com.englishapp.api_server.entity.User;
import lombok.Getter;

@Getter
public class AdminSignupPermitResponse {

    private int userId;
    private String username;
    private String loginId;
    private String tel;
    private UserRole role;
    private UserStatus status;

    public AdminSignupPermitResponse(User user) {
        this.userId = user.getUserId();
        this.username = user.getUsername();
        this.loginId = user.getLoginId();
        this.tel = user.getTel();
        this.role = user.getRole();
        this.status = user.getStatus();
    }
}
