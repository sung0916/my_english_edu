package com.englishapp.api_server.repository;

import com.englishapp.api_server.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // 상품명으로 그룹핑해서 대표 상품(먼저 등록된=보통 1개월) 하나씩만 조회
    @Query("SELECT p FROM Product p WHERE p.id IN " +
            "(SELECT MIN(p2.id) FROM Product p2 GROUP BY p2.productName)")
    Page<Product> findAllRepresentative(Pageable pageable);

    // 상품 검색 (상품명에 포함된 것들 중에서 대표 상품 1개씩만 조회)
    @Query("SELECT p FROM Product p WHERE p.id IN " +
            "(SELECT MIN(p2.id) FROM Product p2 " +
            " WHERE p2.productName LIKE %:keyword% " + // 🔥 검색 조건 추가
            " GROUP BY p2.productName)")
    Page<Product> searchRepresentative(@Param("keyword") String keyword, Pageable pageable);

    // 상세페이지용 (이름으로 상품 목록 찾기)
    List<Product> findByProductName(String productName);
}
