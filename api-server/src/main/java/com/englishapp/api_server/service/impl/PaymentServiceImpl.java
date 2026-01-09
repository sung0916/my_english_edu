package com.englishapp.api_server.service.impl;

import com.englishapp.api_server.domain.OrderStatus;
import com.englishapp.api_server.domain.PaymentStatus;
import com.englishapp.api_server.domain.ProductType;
import com.englishapp.api_server.dto.request.PaymentRequest;
import com.englishapp.api_server.dto.response.PortOneDto;
import com.englishapp.api_server.entity.*;
import com.englishapp.api_server.repository.OrderRepository;
import com.englishapp.api_server.repository.PaymentRepository;
import com.englishapp.api_server.repository.StudentLicenseRepository;
import com.englishapp.api_server.repository.SubscriptionRepository;
import com.englishapp.api_server.service.PaymentService;
import com.englishapp.api_server.util.PortOneClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@Slf4j
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final StudentLicenseRepository studentLicenseRepository;
    private final PortOneClient portOneClient;

    // 결제 검증 및 완료 처리
    @Override
    @Transactional
    public void verifyAndCompletePayment(User user, PaymentRequest.Verify request) {

        // 1. 주문 조회 (TODO: merchant_uid는 "ORD-1234" 형식이므로 파싱 로직 필요 예상)
        Long orderId = parseOrderId(request.getMerchantUid());
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("주문 정보 찾기 실패"));

        // 2. 멱등성 검사 (이미 처리된 주문인지 확인)
        if (order.getStatus() == OrderStatus.PAID) {
            log.info("이미 결제 완료된 주문 (Duplicate Call): orderId={}", orderId);
            return;
        }

        // 3. 주문자 확인 (보안)
        if (!order.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("주문자와 결제자 정보 불일치");
        }

        // 4. 포트원 서버 조회 (교차 검증💫)
        String token = portOneClient.getAccessToken();
        PortOneDto.PaymentResponse paymentResponse = portOneClient.getPaymentInfo(request.getImpUid(), token);
        PortOneDto.PaymentResponse.Response paymentData = paymentResponse.getResponse();

        // 4-1. 포트원 결제 상태 확인
        if (paymentData == null || !"paid".equals(paymentData.getStatus())) {
            throw new IllegalStateException("결제가 완료되지 않은 상태");
        }

        // 4-2. 금액 검증 (DB 주문금액 vs 실제 결제금액) | BigDemical 비교는 compareTo 사용
        BigDecimal realAmount = BigDecimal.valueOf(paymentData.getAmount());
        if (BigDecimal.valueOf(order.getTotalPrice()).compareTo(realAmount) != 0) {
            log.error("결제 금액 불일지❗️ DB={}, PortOne={}", order.getTotalPrice(), request);

            // todo: 필요 시 여기서 '결제 취소' API 자동 호출
            throw new IllegalStateException("결제 금액 위변조 감지⁉️");
        }

        // 5. 결제 정보 저장
        Payment payment = Payment.builder()
                .order(order)
                .pgTid(request.getImpUid())             // 포트원 고유값 (환불 시 필요)
                .pgProvider(request.getPgProvider())    // kakaopay, toss 등
                .status(PaymentStatus.PAID)
                .amount(realAmount)                     // 실제 결제 금액 저장
                .paidAt(LocalDateTime.now())
                .build();
        paymentRepository.save(payment);

        // 6. 주문 상태 변경
        order.changeStatus(OrderStatus.PAID);

        // 7. 상품 지급 (Fulfillment)
        deliverProducts(order);

        log.info("결제 및 상품 지급 완료: OrderId={}, User={}", orderId, user.getEmail());
    }

    // 상품 지급 로직 (구독권 -> 라이선스 발급)
    private void deliverProducts(Order order) {
        for (OrderItem item : order.getOrderItems()) {
            Product product = item.getProduct();

            if (product.getType() == ProductType.SUBSCRIPTION) {
                // 1. Subscription 먼저 생성 및 저장 (라이선스 만들 때 연결을 위해)
                Subscription subscription = Subscription.create(
                        order.getUser(),
                        order,
                        product
                );
                subscriptionRepository.save(subscription);

                // 2. 수량만큼 라이선스 발급 (Subscription ID 전달)
                createLicense(order.getUser(), item, subscription);
            }
        }
    }

    private void createLicense(User user, OrderItem item, Subscription subscription) {
        // 상품 갯수만큼 반복해서 라이선스 생성 (ex: 1년권 2개 샀으면 라이선스 2개)
        for (int i = 0; i < item.getAmount(); i++) {
            StudentLicense license = StudentLicense.createLicense(
                    user,
                    subscription.getId(),
                    item.getProduct().getLicensePeriod() // ONEMONTH, ONEYEAR ...
            );
            studentLicenseRepository.save(license);
        }
    }

    // "ORD-1234" -> 1234L 파싱 헬퍼
    private Long parseOrderId(String merchantUid) {
        try {
            return Long.parseLong(merchantUid.replace("ORD-", ""));
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("잘못된 주문 번호 형식입니다: " + merchantUid);
        }
    }
}
