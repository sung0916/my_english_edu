package com.englishapp.api_server.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserRequest {

    private String username;
    private String loginId;
    private String password;
    private String email;
    private String tel;
}
