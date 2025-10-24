package com.englishapp.api_server.dto.request;

import com.englishapp.api_server.domain.UserRole;
import lombok.Getter;

@Getter
public class ApproveUserRequest {

    private UserRole role;
}
