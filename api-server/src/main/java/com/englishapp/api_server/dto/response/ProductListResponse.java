package com.englishapp.api_server.dto.response;

import com.englishapp.api_server.domain.ProductStatus;
import com.englishapp.api_server.entity.Image;
import com.englishapp.api_server.entity.Product;
import com.englishapp.api_server.util.UrlBuilder;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ProductListResponse {

    private Long id;
    private String productName;
    private int price;
    private String imageUrl;
    private ProductStatus status;

    public static ProductListResponse from(Product product, Image thumbnail) {

        String thumbnailUrl = (thumbnail != null)
                ? UrlBuilder.buildImageUrl(thumbnail.getImageUrl())
                : null;

        return ProductListResponse.builder()
                .id(product.getId())
                .productName(product.getProductName())
                .price(product.getPrice())
                .imageUrl(thumbnailUrl)
                .status(product.getStatus())
                .build();
    }
}
