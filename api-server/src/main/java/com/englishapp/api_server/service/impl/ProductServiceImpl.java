package com.englishapp.api_server.service.impl;

import com.englishapp.api_server.domain.ImageStatus;
import com.englishapp.api_server.domain.ImageType;
import com.englishapp.api_server.dto.request.ProductRequest;
import com.englishapp.api_server.dto.response.ProductListResponse;
import com.englishapp.api_server.dto.response.ProductResponse;
import com.englishapp.api_server.entity.Image;
import com.englishapp.api_server.entity.Product;
import com.englishapp.api_server.entity.User;
import com.englishapp.api_server.repository.ImageRepository;
import com.englishapp.api_server.repository.ProductRepository;
import com.englishapp.api_server.service.ImageService;
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
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ImageRepository imageRepository;
    private final ImageService imageService;

    @Value("${app.base-url}")
    private String baseUrl;

    // 상품 생성
    @Transactional
    public ProductResponse createProduct(ProductRequest.CreateRequest request) {

        // 넘어온 imageIds 로깅
        log.info("상품 생성 productName: {}, received imageIds: {}",
                request.getProductName(), request.getImageIds());

        Product product = request.toEntity();
        Product savedProduct = productRepository.save(product);

        // image의 relatedId 지정 로직
        if (request.getImageIds() != null && !request.getImageIds().isEmpty()) {
            List<Long> imageIds = request.getImageIds();

            for (int i = 0; i < imageIds.size(); i++) {
                final int sortOrder = i;
                Long imageId = imageIds.get(i);

                imageRepository.findById(imageId).ifPresent(image -> {
                    if (image.getStatus() == ImageStatus.PENDING) {
                        image.activate(ImageType.PRODUCT, savedProduct.getId());
                        image.setSortOrder(sortOrder);
                    }
                });
            }
        }

        // 본문 이미지 처리 (자동 파싱 & 연결)
        imageService.activateImagesFromContent(
                request.getDescription(),
                ImageType.PRODUCT,
                savedProduct.getId()
        );

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
        // 1. ID 기반의 Product 엔티티 조회 (존재하지 않으면 EntityNotFoundException 예외 발생
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("해당 상품을 찾을 수 없음: " + id));

        // 2. 이 상품과 연결된 '모든' 이미지(갤러리 + 본문 포함) 조회
        List<Image> allImages = imageRepository.findByTypeAndRelatedId(ImageType.PRODUCT, product.getId());

        // 3. [핵심 로직] 본문(Description)에 포함된 이미지는 갤러리 목록에서 제외하기
        String description = product.getDescription();
        List<Image> galleryImages;

        if (description != null && !description.isEmpty()) {
            galleryImages = allImages.stream()
                    .filter(image -> !description.contains(image.getFileName())) // 본문에 파일명이 없는 것만 남김
                    .collect(Collectors.toList());
        } else {
            // 본문이 없으면 필터링 없이 전체가 갤러리 이미지
            galleryImages = allImages;
        }

        // 4. 필터링된 갤러리 이미지만 DTO에 담아서 반환
        return ProductResponse.from(product, galleryImages);
    }

    // 상품 수정
    @Transactional
    public ProductResponse editProduct(ProductRequest.UpdateRequest request) {
        Product product = productRepository.findById(request.getId())
                .orElseThrow(() -> new EntityNotFoundException("해당 상품을 찾을 수 없음:" + request.getId()));

        //Entity에 업데이트 로직을 위임하여 객체지향적으로 관리
        product.update(request.getProductName(), request.getPrice(), request.getAmount(),
                 request.getDescription(), request.getType(), request.getStatus());

        imageService.activateImagesFromContent(
                request.getDescription(),
                ImageType.PRODUCT,
                product.getId()
        );

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
