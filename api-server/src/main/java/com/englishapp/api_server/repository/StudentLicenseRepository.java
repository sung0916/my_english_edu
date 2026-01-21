package com.englishapp.api_server.repository;

import com.englishapp.api_server.domain.LicenseStatus;
import com.englishapp.api_server.entity.StudentLicense;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudentLicenseRepository extends JpaRepository<StudentLicense, Long> {

    @Query(value = "SELECT sl FROM StudentLicense sl " +
            "JOIN FETCH sl.subscription s " +
            "JOIN FETCH s.product p " +
            "WHERE sl.student.id = :userId",
            countQuery = "SELECT COUNT(sl) FROM StudentLicense sl WHERE sl.student.id = :userId")
    Page<StudentLicense> findAllByStudentIdWithDetails(@Param("userId") Long userId, Pageable pageable);

    Optional<StudentLicense> findFirstByStudentIdAndSubscription_Product_IdAndStatus(Long id, Long productId, LicenseStatus licenseStatus);

    // 환불(Expired) 처리용
    List<StudentLicense> findBySubscription_Order_Id(Long id);

    // 만료 처리용 Bulk Update Query (상태가 Active, 만료기간이 now보다 과거인 경우 -> EXPIRED로 변경)
    @Modifying(clearAutomatically = true)  // 쿼리 실행 후 영속성 컨텍스트 초기화 (데이터 초기화)
    @Query("UPDATE StudentLicense sl SET sl.status = 'EXPIRED' " +
            "WHERE sl.status = 'ACTIVE' AND sl.endAt < :now")
    int bulkExpireLicenses(@Param("now") OffsetDateTime now);
}
