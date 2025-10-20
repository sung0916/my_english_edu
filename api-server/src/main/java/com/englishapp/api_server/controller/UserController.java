package com.englishapp.api_server.controller;

import com.englishapp.api_server.dto.request.UserRequest;
import com.englishapp.api_server.entity.User;
import com.englishapp.api_server.repository.UserRepository;
import com.englishapp.api_server.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        User savedUser = userRepository.save(user);

        try {
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(savedUser);
        } catch (Exception e) {
            log.error("Error 발생 => ", e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .build();
        }
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<User> getUserById(@PathVariable int userId) {
        User user = userService.findUserById(userId);
        try {
            return ResponseEntity.ok(user);
        } catch (EntityNotFoundException e) {
            log.error("사용자를 찾을 수 없습니다. ID: {}", userId, e);
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .build();
        } catch (Exception e) {
            log.error("예상치 못한 에러 발생. ID: {}", userId, e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .build();
        }
    }

    @PatchMapping(("/{userId}"))
    public ResponseEntity<User> editUser(@PathVariable int userId, @RequestBody UserRequest request) {
        User updateUser = userService.updateUser(userId, request);

        try {
            log.info("계정 수정 완료 : {}", userId);
            return ResponseEntity.ok(updateUser);

        } catch (EntityNotFoundException e) {
            log.error("업데이트 실패 : {}", userId, e);
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .build();
        } catch (Exception e) {
            log.error("예상치 못한 에러 : {}", userId, e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .build();
        }
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable int userId) {

        try {
            userService.deleteUser(userId);
            log.info("삭제 완료 : {}", userId);

            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            log.error("해당 계정이 없습니다. : {}", userId, e);
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .build();
        } catch (Exception e) {
            log.error("예상치 못한 에러 : {}", userId, e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .build();
        }
    }
}