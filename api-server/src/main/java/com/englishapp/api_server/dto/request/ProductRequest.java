package com.englishapp.api_server.dto.request;

import com.englishapp.api_server.domain.ProductStatus;
import com.englishapp.api_server.domain.ProductType;
import com.englishapp.api_server.entity.Product;
import lombok.Getter;

public class ProductRequest {

    // 상품 생성
    @Getter
    public static class CreateRequest {

        private String productName;
        private int price;
        private int amount;
        private ProductType type;


        // DTO를 Entity로 변환하는 메서드
        public Product toEntity() {
            return Product.builder()
                    .productName(this.productName)
                    .price(this.price)
                    .amount(this.amount)
                    .type(this.type)
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
        private ProductType type;
        private ProductStatus status;
    }
}
