package com.englishapp.api_server.service.impl;

import com.englishapp.api_server.dto.request.ProductRequest;
import com.englishapp.api_server.dto.response.ProductResponse;
import com.englishapp.api_server.entity.Product;
import com.englishapp.api_server.repository.ProductRepository;
import com.englishapp.api_server.service.ProductService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;

    // 상품 생성
    @Transactional
    public ProductResponse createProduct(ProductRequest.CreateRequest request) {
        Product product = request.toEntity();
        Product savedProduct = productRepository.save(product);

        return ProductResponse.from(savedProduct);
    }

    // 상품 페이징 조회
    public Page<ProductResponse> getAllProducts(Pageable pageable) {
        Page<Product> productPage = productRepository.findAll(pageable);

        // Page<Entity>를 Page<DTO>로 변환
        return productPage.map(ProductResponse::from);
    }

    // 상품 수정
    @Transactional
    public ProductResponse editProduct(ProductRequest.UpdateRequest request) {
        Product product = productRepository.findById(request.getId())
                .orElseThrow(() -> new EntityNotFoundException("해당 상품을 찾을 수 없음:" + request.getId()));

        //Entity에 업데이트 로직을 위임하여 객체지향적으로 관리
        product.update(request.getProductName(), request.getPrice(),
                request.getAmount(), request.getType(), request.getStatus());

        // @Transactional에 의해 메서드 종료 시 변경 감지(dirty checking)되어 자동 업데이트
        return ProductResponse.from(product);
    }

    /** 상품 판매 시 판매량 및 재고 업데이트
     * @param productId 상품 ID
     * @param quantity  구매 수량
     * @info 추후 OrderService 등 결제/주문 관련 서비스에 이 메서드 호출 */
    @Transactional
    public void processSale(Long productId, int quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("해당 상품을 찾을 수 없음: " + productId));

        // 재고 확인 로직
        if (product.getAmount() < quantity) {
            throw new IllegalStateException("상품 재고 부족");
        }

        product.increaseSalesVolume(quantity);
        // 추후 재고 차감 로직 및 엔티티에 관련 로직 추가 예정
    }
}
