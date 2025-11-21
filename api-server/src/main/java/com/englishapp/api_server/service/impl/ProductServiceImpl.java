package com.englishapp.api_server.service.impl;

import com.englishapp.api_server.domain.ImageStatus;
import com.englishapp.api_server.domain.ImageType;
import com.englishapp.api_server.dto.request.ProductRequest;
import com.englishapp.api_server.dto.response.ProductListResponse;
import com.englishapp.api_server.dto.response.ProductResponse;
import com.englishapp.api_server.entity.Image;
import com.englishapp.api_server.entity.Product;
import com.englishapp.api_server.repository.ImageRepository;
import com.englishapp.api_server.repository.ProductRepository;
import com.englishapp.api_server.service.ProductService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ImageRepository imageRepository;

    @Value("${app.base-url}")
    private String baseUrl;

    // 상품 생성
    @Transactional
    public ProductResponse createProduct(ProductRequest.CreateRequest request) {
        Product product = request.toEntity();
        Product savedProduct = productRepository.save(product);

        // image의 relatedId 지정 로직
        if (request.getImageIds() != null && !request.getImageIds().isEmpty()) {
            List<Image> images = imageRepository.findAllById(request.getImageIds());

            for (Image image : images) {
                image.activate(ImageType.PRODUCT, savedProduct.getId());
            }
        }

        return ProductResponse.from(savedProduct);
    }

    // 상품 페이징 조회
    public Page<ProductListResponse> getAllProducts(Pageable pageable) {
        Page<Product> productPage = productRepository.findAll(pageable);

        // map 내부 로직을 람다식으로 풀어서 작성
        return productPage.map(product -> {
            // 각 상품의 대표 이미지 조회
            Image thumbnail = imageRepository
                    .findFirstByTypeAndRelatedIdOrderBySortOrderAsc(
                            ImageType.PRODUCT, product.getId()
                    ).orElse(null);

            // 이미지가 존재하면 리스트에 담고, 없으면 빈 리스트 사용
            /*List<Image> images =
                    thumbnailOptional.map(Collections::singletonList).orElse(Collections.emptyList());*/

            // baseUrl 포함하여 DTO 생성
            return ProductListResponse.from(product, thumbnail);
        });
    }

    /** 상품 상세 정보 조회
     * @param id 조회할 상품의 ID
     * @return 상품 상세 정보 DTO */
    @Override
    public ProductResponse getProductDetail(Long id) {
        // ID 기반의 Product 엔티티 조회 (존재하지 않으면 EntityNotFoundException 예외 발생
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("해당 상품을 찾을 수 없음: " + id));

        // 조회된 상품의 ID와 PRODUCT 타입을 기준으로 관련된 이미지 전체 조회
        List<Image> images = imageRepository.findByTypeAndRelatedId(ImageType.PRODUCT, product.getId());

        // Product 엔티티와 Image 엔티티 목록을 DTO로 변환하여 반환
        return ProductResponse.from(product, images);
    }

    // 상품 수정
    @Transactional
    public ProductResponse editProduct(ProductRequest.UpdateRequest request) {
        Product product = productRepository.findById(request.getId())
                .orElseThrow(() -> new EntityNotFoundException("해당 상품을 찾을 수 없음:" + request.getId()));

        //Entity에 업데이트 로직을 위임하여 객체지향적으로 관리
        product.update(request.getProductName(), request.getPrice(), request.getAmount(),
                 request.getDescription(), request.getType(), request.getStatus());

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
