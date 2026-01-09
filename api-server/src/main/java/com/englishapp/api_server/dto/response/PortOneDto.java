package com.englishapp.api_server.dto.response;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

public class PortOneDto {

    // 1. 토큰 발급 응답
    @Getter
    @NoArgsConstructor
    public static class TokenResponse {
        private Response response;

        @Getter
        @NoArgsConstructor
        public static class Response {
            private String access_token;
            private Long now;
            private Long expired_at;
        }
    }

    // 2. 결제 내역 조회 응답
    @Getter
    @NoArgsConstructor
    @ToString
    public static class PaymentResponse {
        private int code;
        private String message;
        private Response response;

        @Getter
        @NoArgsConstructor
        @ToString
        public static class Response {
            private String imp_uid;        // 결제 고유 번호
            private String merchant_uid;   // 주문 번호
            private int amount;            // 결제된 금액
            private String status;         // paid, ready, failed, canceled
            private String pay_method;     // card, trans, vbank...
            private String pg_provider;    // kakaopay, toss...
            private Long paid_at;
        }
    }
}
