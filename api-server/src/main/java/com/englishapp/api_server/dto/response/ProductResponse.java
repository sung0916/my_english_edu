package com.englishapp.api_server.dto.response;

import com.englishapp.api_server.domain.LicensePeriod;
import com.englishapp.api_server.domain.ProductStatus;
import com.englishapp.api_server.domain.ProductType;
import com.englishapp.api_server.entity.Image;
import com.englishapp.api_server.entity.Product;
import lombok.Builder;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
@Slf4j
public class ProductResponse {

    private Long id;
    private String productName;
    private int price;
    private int amount;
    private String description;
    private int salesVolume;
    private ProductType type;
    private LicensePeriod licensePeriod;
    private ProductStatus status;
    private List<ProductOptionResponse> options;
    private List<ImageResponse> images;

    @Getter
    @Builder
    public static class ProductOptionResponse {
        private Long productId;
        private LicensePeriod licensePeriod;
        private int price;

        public static ProductOptionResponse from(Product product) {
            return ProductOptionResponse.builder()
                    .productId(product.getId())
                    .licensePeriod(product.getLicensePeriod())
                    .price(product.getPrice())
                    .build();
        }
    }

    // Entity를 DTO로 변환하는 정적 메서드
    public static ProductResponse from(Product product, List<Image> images, List<Product> siblingProducts) {
        // 1. Image 리스트 변환
        List<ImageResponse> imageResponses = images.stream()
                .map(ImageResponse::from)
                .collect(Collectors.toList());

        // 2. 형제 상품(옵션) 변환 + 가격순 정렬
        List<ProductOptionResponse> optionResponses = siblingProducts.stream()
                .sorted(Comparator.comparingInt(Product::getPrice)) // 가격 낮은 순 정렬 (1개월 -> 1년)
                .map(ProductOptionResponse::from)
                .toList(); // Java 16+

        return ProductResponse.builder()
                .id(product.getId())
                .productName(product.getProductName())
                .price(product.getPrice())
                .amount(product.getAmount())
                .salesVolume(product.getSalesVolume())
                .description(product.getDescription())
                .type(product.getType())
                .licensePeriod(product.getLicensePeriod())
                .status(product.getStatus())
                .options(optionResponses) // 정렬된 옵션 주입
                .images(imageResponses)
                .build();
    }

    // 목록 조회 등 이미지가 필요 없는 경우를 위한 from 메서드 (오버로딩)
    public static ProductResponse from(Product product) {
        return from(product, Collections.emptyList(), Collections.emptyList()); // 이미지를 빈 리스트로 전달하여 재사용
    }
}
