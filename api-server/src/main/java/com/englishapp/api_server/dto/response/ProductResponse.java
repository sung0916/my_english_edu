package com.englishapp.api_server.dto.response;

import com.englishapp.api_server.domain.ProductStatus;
import com.englishapp.api_server.domain.ProductType;
import com.englishapp.api_server.entity.Product;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ProductResponse {

    private Long id;
    private String productName;
    private int price;
    private int amount;
    private int salesVolume;
    private ProductType type;
    private ProductStatus status;

    // Entity를 DTO로 변환하는 정적 메서드
    public static ProductResponse from(Product product) {

        return ProductResponse.builder()
                .id(product.getId())
                .productName(product.getProductName())
                .price(product.getPrice())
                .amount(product.getAmount())
                .salesVolume(product.getSalesVolume())
                .type(product.getType())
                .status(product.getStatus())
                .build();
    }
}
