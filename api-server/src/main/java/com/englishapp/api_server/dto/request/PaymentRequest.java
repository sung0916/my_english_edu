package com.englishapp.api_server.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;

public class PaymentRequest {

    @Getter
    @NoArgsConstructor
    public static class Verify {
        private String paymentId;    // 포트원 결제 고유 번호
        private String merchantUid;  // 우리 서버 주문 번호(order_id와 매핑됨)
        private int amount;          // 결제된 금액
        private String pgProvider;   // 예: kakaopay, tosspay 등 결제사
    }
}
