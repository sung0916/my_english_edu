package com.englishapp.api_server.dto.response;

import com.englishapp.api_server.domain.UserRole;
import com.englishapp.api_server.entity.User;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UserResponse {

    private Long userId;
    private String username;
    private String loginId;
    private String email;
    private String tel;
    private UserRole role;

    // Entity를 DTO로 변환하는 생성자
    public UserResponse(User user) {

        this.userId = user.getId();
        this.username = user.getUsername();
        this.loginId = user.getLoginId();
        this.email = user.getEmail();
        this.tel = user.getTel();
        this.role = user.getRole();
    }
}
