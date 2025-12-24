package com.englishapp.api_server.dto.response;

import com.englishapp.api_server.entity.Cart;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CartResponse {

    private Long cartId;
    private Long productId;
    private String productName;
    private int price;
    private int amount;
    private int totalPrice;
    private String thumbnailImageUrl;  // 대표이미지

    public static CartResponse from(Cart cart) {

        return CartResponse.builder()
                .cartId(cart.getId())
                .productId(cart.getProduct().getId())
                .productName(cart.getProduct().getProductName())
                .price(cart.getProduct().getPrice())
                .amount(cart.getAmount())
                .totalPrice(cart.getProduct().getPrice() * cart.getAmount())
                // .thumbnailImageUrl()
                .build();
    }
}
