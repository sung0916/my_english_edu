package com.englishapp.api_server.repository;

import com.englishapp.api_server.domain.LicenseStatus;
import com.englishapp.api_server.entity.StudentLicense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LicenseRepository extends JpaRepository<StudentLicense, Long> {

    // Fetch Join으로 Subscription과 Product까지 한번에 조회하여 성능 최적화 (N+1 해결)
    /*@Query("SELECT sl FROM StudentLicense sl " +
            "JOIN FETCH sl.subscription s " +
            "JOIN FETCH s.product p " +
            "WHERE sl.student.id = :userId " +
            "ORDER BY sl.id DESC")*/
    @Query(value = "SELECT sl FROM StudentLicense sl " +
            "JOIN FETCH sl.subscription s " +
            "JOIN FETCH s.product p " +
            "WHERE sl.student.id = :userId",
            countQuery = "SELECT count(sl) FROM StudentLicense sl WHERE sl.student.id = :userId")
    List<StudentLicense> findAllByStudentIdWithDetails(@Param("userId") Long userId);

    // 특정 유저가 가진 특정 상품의 'PENDING' 상태 라이선스 1개 조회 (활성화용)
    Optional<StudentLicense> findFirstByStudentIdAndSubscription_Product_IdAndStatus(
            Long studentId, Long productId, LicenseStatus status
    );
}
