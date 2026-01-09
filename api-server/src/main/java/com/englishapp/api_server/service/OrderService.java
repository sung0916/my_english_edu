package com.englishapp.api_server.service;

import com.englishapp.api_server.dto.request.OrderRequest;
import com.englishapp.api_server.dto.response.OrderResponse;
import com.englishapp.api_server.entity.User;

import java.util.List;

public interface OrderService {

    // 장바구니 항목으로 주문 생성
    OrderResponse createOrderFromCart(User user, OrderRequest.Create request);

    // 주문 목록 조회
    List<OrderResponse> getMyOrders(User user);

    // 주문 상세 조회 (영수증 보기) - 권한 체크(내 주문, 관리자)
    OrderResponse getOrderDetail(User user, Long orderId);
}
