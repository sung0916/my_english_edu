package com.englishapp.api_server.service.impl;

import com.englishapp.api_server.domain.ImageStatus;
import com.englishapp.api_server.domain.ImageType;
import com.englishapp.api_server.dto.request.OrderRequest;
import com.englishapp.api_server.dto.response.OrderResponse;
import com.englishapp.api_server.entity.*;
import com.englishapp.api_server.repository.CartRepository;
import com.englishapp.api_server.repository.ImageRepository;
import com.englishapp.api_server.repository.OrderRepository;
import com.englishapp.api_server.repository.PaymentRepository;
import com.englishapp.api_server.service.OrderService;
import com.englishapp.api_server.util.UrlBuilder;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;  // Product 엔티티가 담겨있음
    private final ImageRepository imageRepository;
    private final PaymentRepository paymentRepository;

    // 장바구니 항목을 기반으로 주문 생성
    @Override
    @Transactional
    public OrderResponse createOrderFromCart(User user, OrderRequest.Create request) {

        // 1. 장바구니 조회(선택된 ID들만)
        List<Cart> carts = cartRepository.findByUserIdAndIdIn(user.getId(), request.getCartIds());

        if (carts.isEmpty()) {
            throw new IllegalArgumentException("주문할 장바구니 항목이 없습니다.");
        }

        // 2. OrderItem 리스트 생성(이 과정에서 Product 재고 감소 발생)
        List<OrderItem> orderItems = carts.stream()
                .map(cart -> OrderItem.createOrderItem(cart.getProduct(), cart.getAmount()))
                .collect(Collectors.toList());

        // 3. 주문 생성
        Order order = Order.createOrder(user, orderItems);

        // 4. 주문 저장 (Cascade로 OrderItem 자동 저장)
        orderRepository.save(order);
        
        log.info("주문 생성 완료: OrderID={}, User={}, Price={}",
                order.getId(), user.getUsername(), order.getTotalPrice());
        Map<Long, String> thumbnailMap = getThumbnailMap(List.of(order));
        Map<Long, Payment> paymentMap = getPaymentMap(List.of(order));
        return OrderResponse.from(order, thumbnailMap, paymentMap);
    }

    // 주문 목록 조회
    @Override
    public List<OrderResponse> getMyOrders(User user) {

        List<Order> orders =
                orderRepository.findAllByUserIdOrderByOrderedAtDesc(user.getId());

        Map<Long, String> thumbnailMap = getThumbnailMap(orders);
        Map<Long, Payment> paymentMap = getPaymentMap(orders);

        return orders.stream()
                .map(order -> OrderResponse.from(order, thumbnailMap, paymentMap))
                .collect(Collectors.toList());
    }

    // 주문 상세 조회 (영수증 보기) - 권한 체크(내 주문, 관리자)
    @Override
    public OrderResponse getOrderDetail(User user, Long orderId) {

        // 1. 주문 조회 (상품 정보까지 fetch join으로 한번에 가져옴)
        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new EntityNotFoundException("주문을 찾을 수 없습니다." + orderId));

        // 2. 데이터 소유권 확인 (보안 검증)
        checkOwnership(user, order);

        // 3. 해당 주문의 썸네일, 결제 정보 Map 생성
        Map<Long, String> thumbnailMap = getThumbnailMap(List.of(order));
        Map<Long, Payment> paymentMap = getPaymentMap(List.of(order));

        // 4. DTO 반환 (items 리스트 포함됨)
        return OrderResponse.from(order, thumbnailMap, paymentMap);
    }

    // 주문 리스트에서 상품 ID로 이미지 Map 생성
    private Map<Long, String> getThumbnailMap(List<Order> orders) {
        if (orders.isEmpty()) {
            return Collections.emptyMap();
        }

        // 주문에 포함된 모든 Product ID 추출 (중복 제거)
        List<Long> productIds = orders.stream()
                .flatMap(o -> o.getOrderItems().stream())
                .map(item -> item.getProduct().getId())
                .distinct()
                .toList();

        if (productIds.isEmpty()) {
            return Collections.emptyMap();
        }

        // 상품 ID들로 이미지 조회
        List<Image> images = imageRepository.findByRelatedIdInAndTypeAndStatus(
                productIds,
                ImageType.PRODUCT,
                ImageStatus.ACTIVE);

        // Map<ProductId, ImageUrl> 변환
        return images.stream()
                .sorted(Comparator.comparingInt(Image::getSortOrder))
                .collect(Collectors.toMap(
                        Image::getRelatedId,  // Key: 상품 ID
                        image -> UrlBuilder.buildImageUrl(image.getImageUrl()),  // Value: 전체 URL
                        (prev, next) -> prev  // 중복 키(상품당 이미지 여러개)가 있으면 첫번째 사용
                ));
    }

    // PaymentMap 생성 헬퍼 메서드
    private Map<Long, Payment> getPaymentMap(List<Order> orders) {
        if (orders.isEmpty()) return Collections.emptyMap();
        List<Long> orderIds = orders.stream().map(Order::getId).toList();
        List<Payment> payments = paymentRepository.findByOrderIdIn(orderIds);

        return payments.stream()
                .collect(Collectors.toMap(
                        p -> p.getOrder().getId(),   // Key: Order ID
                        p -> p,                      // Value: Payment 객체 자체
                        (p1, p2) -> p1      // 중복 시 첫번째 유지
                ));
    }

    // 주문 소유권 검증 로직 (주문자(order.user), 로그인한 사람 비교 및 관리자인지 체크)
    private void checkOwnership(User user, Order order) {
        boolean isOwner = order.getUser().getId().equals(user.getId());
        boolean isAdmin = user.getRole().name().equals("ADMIN");

        if (!isOwner && !isAdmin) {
            log.warn("권한 없는 주문 접근: User={}, OrderId={}", user.getId(), order.getId());
            throw new AccessDeniedException("해당 주문에 접근 권한 없음");
        }
    }
}
