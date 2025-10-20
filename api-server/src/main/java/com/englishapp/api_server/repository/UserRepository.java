package com.englishapp.api_server.repository;

import com.englishapp.api_server.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    Optional<User> findByLoginId(String loginId);  // AuthController용 임시 코드
}
