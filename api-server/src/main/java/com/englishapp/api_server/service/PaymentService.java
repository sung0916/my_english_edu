package com.englishapp.api_server.service;

import com.englishapp.api_server.dto.request.PaymentRequest;
import com.englishapp.api_server.entity.User;
import org.springframework.transaction.annotation.Transactional;

public interface PaymentService {

    // 결제 검증 및 완료 처리
    @Transactional
    void verifyAndCompletePayment(User user, PaymentRequest.Verify request);
}
