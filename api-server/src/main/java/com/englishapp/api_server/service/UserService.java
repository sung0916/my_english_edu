package com.englishapp.api_server.service;

import com.englishapp.api_server.dto.request.UserRequest;
import com.englishapp.api_server.entity.User;

public interface UserService {

    User updateUser(int userId, UserRequest userRequest);

    void deleteUser(int userId);

    User findUserById(int userId);
}
