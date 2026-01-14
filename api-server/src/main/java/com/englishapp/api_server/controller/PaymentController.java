package com.englishapp.api_server.controller;

import com.englishapp.api_server.dto.request.PaymentRequest;
import com.englishapp.api_server.entity.User;
import com.englishapp.api_server.service.PaymentService;
import com.englishapp.api_server.service.impl.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    // 결제 검증 API (클라이언트에서 결제 성공 후 호출)
    @PostMapping("/complete")
    public ResponseEntity<String> verifyPayment(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody PaymentRequest.Verify request
            ) {

        User user;
        if (userDetails != null) {
            user = userDetails.getUser();
        } else {
            throw new IllegalArgumentException("로그인 정보 없음");
        }

        paymentService.verifyAndCompletePayment(userDetails.getUser(), request);
        return ResponseEntity.ok("결제가 정상적으로 완료됨");
    }
}
