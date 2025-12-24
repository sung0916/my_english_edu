package com.englishapp.api_server.dto.request;

import lombok.Getter;

public class CartRequest {

    @Getter
    public static class Add {
        private Long productId;
        private int amount;
    }

    @Getter
    public static class Update {
        private Long cartId;
        private int amount;
    }
}
