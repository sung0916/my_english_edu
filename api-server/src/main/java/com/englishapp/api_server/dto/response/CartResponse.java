package com.englishapp.api_server.dto.response;

import com.englishapp.api_server.domain.ProductStatus;
import com.englishapp.api_server.entity.Cart;
import com.englishapp.api_server.entity.Image;
import com.englishapp.api_server.util.UrlBuilder;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CartResponse {

    private Long cartId;
    private Long productId;
    private String productName;
    private ProductStatus status;
    private int price;
    private int amount;
    private int totalPrice;
    private String thumbnailImageUrl;  // 대표이미지

    public static CartResponse from(Cart cart, Image thumbnail) {
        String imageUrl = null;
        if (thumbnail != null) {
            imageUrl = UrlBuilder.buildImageUrl(thumbnail.getImageUrl());
        }

        return CartResponse.builder()
                .cartId(cart.getId())
                .productId(cart.getProduct().getId())
                .productName(cart.getProduct().getProductName())
                .price(cart.getProduct().getPrice())
                .amount(cart.getAmount())
                .totalPrice(cart.getProduct().getPrice() * cart.getAmount())
                .status(cart.getProduct().getStatus())
                .thumbnailImageUrl(imageUrl)
                .build();
    }
}
