package com.englishapp.api_server.repository;

import com.englishapp.api_server.domain.UserStatus;
import com.englishapp.api_server.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByLoginId(String loginId);

    List<User> findByStatus(UserStatus status);

    // 이름으로 검색
    List<User> findByUsernameContaining(String keyword);
}
