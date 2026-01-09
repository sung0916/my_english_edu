package com.englishapp.api_server.dto.request;

import com.englishapp.api_server.domain.LicensePeriod;
import com.englishapp.api_server.domain.ProductStatus;
import com.englishapp.api_server.domain.ProductType;
import com.englishapp.api_server.entity.Product;
import lombok.Getter;

import java.util.List;

public class ProductRequest {

    // 상품 생성
    @Getter
    public static class CreateRequest {

        private String productName;
        private int price;
        private int amount;
        private String description;
        private ProductType type;
        private List<Long> imageIds;
        private LicensePeriod licensePeriod;

        // DTO를 Entity로 변환하는 메서드
        public Product toEntity() {
            return Product.builder()
                    .productName(this.productName)
                    .price(this.price)
                    .amount(this.amount)
                    .description(this.description)
                    .type(this.type)
                    .licensePeriod(licensePeriod)
                    .build();
        }
    }

    // 상품 수정
    @Getter
    public static class UpdateRequest {

        private Long id;
        private String productName;
        private Integer price;
        private Integer amount;
        private String description;
        private ProductType type;
        private ProductStatus status;
    }
}
