package com.englishapp.api_server.dto.request;

import com.englishapp.api_server.domain.UserRole;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserSignupRequest {

    private UserRole role;
}
