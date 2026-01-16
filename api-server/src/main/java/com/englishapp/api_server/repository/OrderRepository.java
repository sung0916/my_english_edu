package com.englishapp.api_server.repository;

import com.englishapp.api_server.domain.OrderStatus;
import com.englishapp.api_server.domain.ProductType;
import com.englishapp.api_server.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    // 관리자용 판매 상품 필터링 조회
    // 1. status가 null이면 전체 조회, 있으면 해당 상태만 조회
    // 2. productType이 null이면 전체 조회, 있으면 해당 타입 상품이 포함된 주문만 조회
    // 3. 페이징 적용 + 최신순 정렬
    @Query("SELECT DISTINCT o FROM Order o " +
            "JOIN FETCH o.user u " +
            "JOIN o.orderItems oi " +
            "JOIN oi.product p " +
            "WHERE (:status IS NULL OR o.status = :status) " +
            "AND (:productType IS NULL OR p.type = :productType)")
    Page<Order> findByFilters(
            @Param("status") OrderStatus status,
            @Param("productType") ProductType productType,
            Pageable pageable
    );
}
