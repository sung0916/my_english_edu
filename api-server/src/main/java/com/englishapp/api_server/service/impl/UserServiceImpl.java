package com.englishapp.api_server.service.impl;

import com.englishapp.api_server.dto.request.UserRequest;
import com.englishapp.api_server.entity.User;
import com.englishapp.api_server.repository.UserRepository;
import com.englishapp.api_server.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public User findUserById(int userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("'" +userId + "'를 찾지 못했습니다."));
    }

    @Override
    public User updateUser(int userId, UserRequest userRequest) {
        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("유저가 존재하지 않습니다 : " + userId));

        if (userRequest.getPassword() != null && !userRequest.getPassword().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(userRequest.getPassword()));
        }
        if (userRequest.getEmail() != null) {
            existingUser.setEmail(userRequest.getEmail());
        }
        if (userRequest.getTel() != null) {
            existingUser.setTel(userRequest.getTel());
        }
        return existingUser;
    }

    @Override
    @Transactional
    public void deleteUser(int userId) {

        if (!userRepository.existsById(userId)) {
            throw new EntityNotFoundException("유저가 존재하지 않습니다 : " + userId);
        }
        userRepository.deleteById(userId);
    }
}