package com.englishapp.api_server.controller;

import com.englishapp.api_server.dto.request.ProductRequest;
import com.englishapp.api_server.dto.response.ProductListResponse;
import com.englishapp.api_server.dto.response.ProductResponse;
import com.englishapp.api_server.entity.User;
import com.englishapp.api_server.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
@Slf4j
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    /** 상품 생성
     *  @param request 상품 생성 정보
     *  @return 생성된 상품 정보와 201 Created 상태 코드 */
    @PostMapping("/create")
    public ResponseEntity<ProductResponse> createProduct(
            @RequestBody ProductRequest.CreateRequest request) {

        log.info("상품 생성 요청: {}", request.getProductName());
        ProductResponse response = productService.createProduct(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /** 상품 목록
     *  @param pageable (예: /api/products/list?page=0&size=10&sort=id,desc)
     *  @return 상품 목록 페이지와 200 OK 상태 코드 */
    @GetMapping("/list")
    public ResponseEntity<Page<ProductListResponse>> getAllProducts(
            Pageable pageable,
            @RequestParam(required = false) String searchType,
            @RequestParam(required = false) String searchKeyword) {

        log.info("상품 목록 조회 요청 페이지: {}, 사이즈: {}", pageable.getPageNumber(), pageable.getPageSize());
        Page<ProductListResponse> productPage = productService.getAllProducts(pageable, searchType, searchKeyword);

        return ResponseEntity.ok(productPage);
    }

    /** 상품 상세 조회
     * @param id 조회할 상품의 ID
     * @return 상품 상세 정보와 200 OK 상태 코드 */
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductDetail(@PathVariable Long id) {
        log.info("상품 상제 조회 요청: ID {}", id);
        ProductResponse response = productService.getProductDetail(id);
        return ResponseEntity.ok(response);
    }

    /** 상품 수정
     *  @param request 상품 수정 정보(id 포함)
     *  @return 수정된 상품 정보와 200 OK 상태 코드 */
    @PatchMapping("/edit")
    public ResponseEntity<ProductResponse> editProduct(@RequestBody ProductRequest.UpdateRequest request) {

        log.info("상품 수정 요청: {}", request.getProductName());
        ProductResponse response = productService.editProduct(request);

        return ResponseEntity.ok(response);
    }
}
