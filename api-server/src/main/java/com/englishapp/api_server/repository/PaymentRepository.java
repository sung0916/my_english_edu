package com.englishapp.api_server.repository;

import com.englishapp.api_server.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByOrder_Id(Long orderId);

    // 주문 상제 페이지의 결제 방법 조회용
    List<Payment> findByOrderIdIn(List<Long> orderIds);
}
