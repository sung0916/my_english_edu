package com.englishapp.api_server.repository;

import com.englishapp.api_server.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // 1. 내 주문 목록 조회
    List<Order> findAllByUserIdOrderByOrderedAtDesc(Long userId);

    // 2. 주문 상세 조회 (Order -> OrderItems -> Product 까지 한방에 조회)
    // 일반 findById를 쓰면 getProduct() 할 때마다 쿼리가 나가므로 성능 최적화
    @Query("SELECT o FROM Order o JOIN FETCH o.orderItems oi JOIN FETCH oi.product WHERE o.id = :orderId")
    Optional<Order> findByIdWithItems(@Param("orderId") Long orderId);
}
