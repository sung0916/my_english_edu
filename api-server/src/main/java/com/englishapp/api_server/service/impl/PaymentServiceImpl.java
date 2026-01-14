package com.englishapp.api_server.service.impl;

import com.englishapp.api_server.domain.OrderStatus;
import com.englishapp.api_server.domain.PaymentStatus;
import com.englishapp.api_server.domain.ProductType;
import com.englishapp.api_server.dto.request.PaymentRequest;
import com.englishapp.api_server.dto.response.PortOneDto;
import com.englishapp.api_server.entity.*;
import com.englishapp.api_server.repository.*;
import com.englishapp.api_server.service.PaymentService;
import com.englishapp.api_server.util.PortOneClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final StudentLicenseRepository studentLicenseRepository;
    private final PortOneClient portOneClient;
    private final CartRepository cartRepository;

    // 결제 검증 및 완료 처리
    @Override
    @Transactional
    public void verifyAndCompletePayment(User user, PaymentRequest.Verify request) {

        // 1. [DB 조회] 주문번호(merchantUid) 사용 -> "내 장부 확인"
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
        log.info("검증 요청 시작: PaymentId(UUID)={}, MerchantUid(OrderNo)={}", request.getPaymentId(), request.getMerchantUid());
        String token = portOneClient.getAccessToken();
        PortOneDto.PaymentResponse paymentResponse = portOneClient.getPaymentInfo(request.getPaymentId(), token);
        PortOneDto.PaymentResponse.Response paymentData = paymentResponse.getResponse();

        // 4-1. 포트원 결제 상태 확인
        if (paymentData == null || !"paid".equalsIgnoreCase(paymentData.getStatus())) {
            throw new IllegalStateException("결제가 완료되지 않은 상태입니다. Status=" + (paymentData != null
                    ? paymentData.getStatus()
                    : "null"));
        }

        // 4-2. 금액 검증 (DB 주문금액 vs 실제 결제금액)
        BigDecimal orderPrice = BigDecimal.valueOf(order.getTotalPrice());
        BigDecimal paidPrice = BigDecimal.valueOf(paymentData.getAmount());

        if (orderPrice.compareTo(paidPrice) != 0) {
            log.error("결제 금액 불일치❗️ DB={}, PortOne={}", orderPrice, paidPrice);
            // todo: 필요 시 결제 취소 API 호출 로직 추가
            throw new IllegalStateException("결제 금액 위변조 감지: 주문금액(" + orderPrice + ") != 결제금액(" + paidPrice + ")");
        }

        // 5. 결제 정보 저장
        Payment payment = Payment.builder()
                .order(order)
                .pgTid(paymentData.getImp_uid())         // PortOne V2의 TransactionId가 들어옴
                .pgProvider(request.getPgProvider())     // request에서 받은 PG사 정보 (html5_inicis 등)
                .status(PaymentStatus.PAID)
                .amount(paidPrice)                       // 👈 [수정됨] realAmount -> paidPrice 로 변수명 일치시킴
                .paidAt(LocalDateTime.now())
                .build();
        paymentRepository.save(payment);

        // 6-1. 주문 상태 변경
        order.changeStatus(OrderStatus.PAID);

        // 6-2. 결제 성공 후 장바구니 비우기
        clearCartItems(user, order);

        // 7. 상품 지급 (Fulfillment)
        deliverProducts(order);

        log.info("결제 및 상품 지급 완료: OrderId={}, User={}", orderId, user.getEmail());
    }

    // --- 아래 Helper 메서드들은 기존과 동일 ---

    private void clearCartItems(User user, Order order) {
        List<Long> productIds = order.getOrderItems().stream()
                .map(item -> item.getProduct().getId())
                .toList();

        List<Cart> itemsToDelete = cartRepository.findByUserIdAndProductIdIn(user.getId(), productIds);
        cartRepository.deleteAll(itemsToDelete);
    }

    private void deliverProducts(Order order) {
        for (OrderItem item : order.getOrderItems()) {
            Product product = item.getProduct();

            if (product.getType() == ProductType.SUBSCRIPTION) {
                Subscription subscription = Subscription.create(
                        order.getUser(),
                        order,
                        product
                );
                subscriptionRepository.save(subscription);
                createLicense(order.getUser(), item, subscription);
            }
        }
    }

    private void createLicense(User user, OrderItem item, Subscription subscription) {
        for (int i = 0; i < item.getAmount(); i++) {
            StudentLicense license = StudentLicense.createLicense(
                    user,
                    subscription.getId(),
                    item.getProduct().getLicensePeriod()
            );
            studentLicenseRepository.save(license);
        }
    }

    private Long parseOrderId(String merchantUid) {
        try {
            return Long.parseLong(merchantUid.replace("ORD-", ""));
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("잘못된 주문 번호 형식입니다: " + merchantUid);
        }
    }
}
