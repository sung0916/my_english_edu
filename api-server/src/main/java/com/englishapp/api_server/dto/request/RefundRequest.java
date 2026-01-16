package com.englishapp.api_server.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class RefundRequest {

    private Long orderId;
    private String reason;
}
