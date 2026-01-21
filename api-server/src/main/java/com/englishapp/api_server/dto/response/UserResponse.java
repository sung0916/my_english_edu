package com.englishapp.api_server.dto.response;

import com.englishapp.api_server.domain.UserRole;
import com.englishapp.api_server.entity.User;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Getter
@NoArgsConstructor
public class UserResponse {

    private Long userId;
    private String username;
    private String loginId;
    private String email;
    private String tel;
    private String status;
    private UserRole role;
    private String timezone;

    @JsonFormat(pattern = "yy-MM-dd'T'HH:mm:ssXXX", timezone = "UTC")
    private OffsetDateTime createdAt;

    // Entity를 DTO로 변환하는 생성자
    public UserResponse(User user) {

        this.userId = user.getId();
        this.username = user.getUsername();
        this.loginId = user.getLoginId();
        this.email = user.getEmail();
        this.tel = user.getTel();
        this.status = user.getStatus().name();
        this.role = user.getRole();
        this.timezone = user.getTimezone();
        this.createdAt = user.getCreatedAt();
    }
}
