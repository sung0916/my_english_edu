package com.englishapp.api_server.entity;

import com.englishapp.api_server.domain.UserRole;
import com.englishapp.api_server.domain.UserStatus;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "user")
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long id;

    @Column(nullable = false, length = 100)
    private String username;

    @Column(nullable = false, length = 100)
    private String loginId;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(nullable = false, length = 255)
    private String email;

    @Column(nullable = false, length = 20)
    private String tel;

    @Enumerated(value = EnumType.STRING)
    private UserRole role;

    @Enumerated(value = EnumType.STRING)
    private UserStatus status;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // 회원 정보 수정
    public void updatePassword(String newPassword) {
        this.password = newPassword;
    }

    // 회원 정보 수정
    public void updateEmail(String newEmail) {
        this.email = newEmail;
    }

    // 회원 정보 수정
    public void updateTel(String newTel) {
        this.tel = newTel;
    }

    // 회원 탈퇴 처리
    public void withdraw() {

        // 이미 탈퇴한 사용자인지 확인
        if (this.status == UserStatus.DELETED) {
            throw new IllegalStateException("이미 탈퇴한 사용자입니다.");
        }

        // 상태를 DELETED로 변경
        this.status = UserStatus.DELETED;

        this.email = "-";
        this.tel = "-"; // 전화번호는 null로 변경
        this.password = "-";
    }

    // 관리자 가입 승인
    public void approve(UserRole role) {
        if (this.status == UserStatus.ACTIVE) {
            throw new IllegalStateException("이미 활성화된 사용자");
        }

        this.role = role;
        this.status = UserStatus.ACTIVE;
    }

    // 회원 삭제
    public void deleteByAdmin() {
        if (this.status == UserStatus.DELETED) {
            throw new IllegalStateException("이미 삭제 처리된 사용자입니다.");
        }

        this.status = UserStatus.DELETED;
        this.email = "deleted_by_admin@" + this.id;
        this.tel = null;
        this.password = "deleted_by_admin_password";
    }
}