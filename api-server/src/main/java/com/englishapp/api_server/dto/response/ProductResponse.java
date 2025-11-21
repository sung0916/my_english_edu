package com.englishapp.api_server.dto.response;

import com.englishapp.api_server.domain.ProductStatus;
import com.englishapp.api_server.domain.ProductType;
import com.englishapp.api_server.entity.Image;
import com.englishapp.api_server.entity.Product;
import lombok.Builder;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

import java.util.Collections;
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
    private ProductStatus status;
    private List<ImageResponse> images;

    /* ImageResponse, UrlBuilder 리팩토링으로 필요없음
    @Getter
    @Builder
    private static class ImageResponse {
        private Long id;
        private String imageUrl;

        // Image 엔티티와 서버의 base-url을 받아 전체 URL을 조립
        public static ImageResponse from(Image image, String baseUrl) {

            String dbPath = image.getImageUrl();  // DB에 저장된 상대 경로 (예: "images/...")
            String fullUrl = baseUrl + "/images/" + dbPath;

            log.info("Image URL 조립: baseUrl='{}', fileName='{}', fullUrl='{}'",
                    baseUrl, image.getFileName(), fullUrl);

            return ImageResponse.builder()
                    .id(image.getId())
                    .imageUrl(fullUrl)
                    .build();
        }
    } */

    // Entity를 DTO로 변환하는 정적 메서드
    public static ProductResponse from(Product product, List<Image> images) {
        // Image 리스트를 ImageResponse 리스트로 변환
        List<ImageResponse> imageResponses = images.stream()
                .map(ImageResponse::from)
                .collect(Collectors.toList());

        return ProductResponse.builder()
                .id(product.getId())
                .productName(product.getProductName())
                .price(product.getPrice())
                .amount(product.getAmount())
                .salesVolume(product.getSalesVolume())
                .description(product.getDescription())
                .type(product.getType())
                .status(product.getStatus())
                .images(imageResponses)
                .build();
    }

    // 목록 조회 등 이미지가 필요 없는 경우를 위한 from 메서드 (오버로딩)
    public static ProductResponse from(Product product) {
        return from(product, Collections.emptyList()); // 이미지를 빈 리스트로 전달하여 재사용
    }
}
