package com.englishapp.api_server.service.impl;

import com.englishapp.api_server.dto.request.OrderRequest;
import com.englishapp.api_server.dto.response.OrderResponse;
import com.englishapp.api_server.entity.Cart;
import com.englishapp.api_server.entity.Order;
import com.englishapp.api_server.entity.OrderItem;
import com.englishapp.api_server.entity.User;
import com.englishapp.api_server.repository.CartRepository;
import com.englishapp.api_server.repository.OrderRepository;
import com.englishapp.api_server.service.OrderService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;  // Product 엔티티가 담겨있음

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

        // 5. 장바구니 비우기 (주문된 항목만 삭제)
        cartRepository.deleteAll(carts);

        log.info("주문 생성 완료: OrderID={}, User={}, Price={}",
                order.getId(), user.getUsername(), order.getTotalPrice());

        return OrderResponse.from(order);
    }

    // 주문 목록 조회
    @Override
    public List<OrderResponse> getMyOrders(User user) {

        List<Order> orders =
                orderRepository.findAllByUserIdOrderByOrderedAtDesc(user.getId());

        return orders.stream()
                .map(OrderResponse::from)
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

        // 3. DTO 반환 (items 리스트 포함됨)
        return OrderResponse.from(order);
    }

    // 주문 소유권 검증 로직 (주문자(order.user), 로그인한 사람 비교 및 관리자인지 체크)
    private void checkOwnership(User user, Order order) {
        boolean isOwner = order.getUser().getId().equals(user.getId());
        boolean isAdmin = "ADMIN".equals(user.getRole());

        if (!isOwner && !isAdmin) {
            log.warn("권한 없는 주문 접근: User={}, OrderId={}", user.getId(), order.getId());
            throw new AccessDeniedException("해당 주문에 접근 권한 없음");
        }
    }
}
