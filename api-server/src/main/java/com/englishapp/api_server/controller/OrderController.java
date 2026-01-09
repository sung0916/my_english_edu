package com.englishapp.api_server.controller;

import com.englishapp.api_server.dto.request.OrderRequest;
import com.englishapp.api_server.dto.response.OrderResponse;
import com.englishapp.api_server.service.OrderService;
import com.englishapp.api_server.service.impl.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody OrderRequest.Create request
            ) {

        OrderResponse response = orderService.createOrderFromCart(userDetails.getUser(), request);

        return ResponseEntity.ok(response);
    }

    // 내 주문 목록 조회
    @GetMapping
    public ResponseEntity<List<OrderResponse>> getMyOrders(
        @AuthenticationPrincipal UserDetailsImpl userDetails) {

        List<OrderResponse> responses = orderService.getMyOrders(userDetails.getUser());
        return ResponseEntity.ok(responses);
    }

    // 주문 상세 조회
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrderDetail(
        @AuthenticationPrincipal UserDetailsImpl userDetails,
        @PathVariable Long orderId) {

        OrderResponse response = orderService.getOrderDetail(userDetails.getUser(), orderId);
        return ResponseEntity.ok(response);
    }
}
