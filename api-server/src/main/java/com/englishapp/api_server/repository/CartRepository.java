package com.englishapp.api_server.repository;

import com.englishapp.api_server.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {

    // 특정 유저의 장바구니 목록 조회 (fetch join 사용)
    @Query("SELECT c FROM Cart c JOIN FETCH c.product WHERE c.user.id = :userId")
    List<Cart> findByUserId(@Param("userId") Long userId);

    // 장바구니에 있는 상품인지 확인
    Optional<Cart> findByUserIdAndProductId(Long userId, Long productId);

    // 장바구니에서 선택된 상품들 조회
    @Query("SELECT c FROM Cart c JOIN FETCH c.product WHERE c.user.id = :userId AND c.id IN :cartIds")
    List<Cart> findByUserIdAndIdIn(@Param("userId") Long id, @Param("cartIds") List<Long> cartIds);

    // 유저 ID와 상품 ID 리스트로 장바구니 아이템 조회
    List<Cart> findByUserIdAndProductIdIn(Long userId, List<Long> productIds);
}
