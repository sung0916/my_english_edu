package com.englishapp.api_server.service;

import com.englishapp.api_server.dto.request.ProductRequest;
import com.englishapp.api_server.dto.response.ProductListResponse;
import com.englishapp.api_server.dto.response.ProductResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProductService {

    // 상품 생성
    ProductResponse createProduct(ProductRequest.CreateRequest request);

    // 상품 목록
    Page<ProductListResponse> getAllProducts(Pageable pageable);

    // 상품 수정
    ProductResponse editProduct(ProductRequest.UpdateRequest request);

    // 상품 상세 페이지
    ProductResponse getProductDetail(Long id);
}
