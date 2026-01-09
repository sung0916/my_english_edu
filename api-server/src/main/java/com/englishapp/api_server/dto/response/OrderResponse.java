package com.englishapp.api_server.dto.response;

import com.englishapp.api_server.domain.OrderStatus;
import com.englishapp.api_server.entity.Order;
import com.englishapp.api_server.entity.OrderItem;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
public class OrderResponse {

    private Long orderId;
    private int totalPrice;
    private String orderName;  // "OOO외 N건"
    private LocalDateTime orderedAt;
    private OrderStatus status;

    private List<OrderItemDto> items;  // 상세 조회를 위한 아이템 리스트 (필요 시 사용)

    // 내부 클래스로 아이템 정보 정의
    @Getter
    @Builder
    public static class OrderItemDto {
        private Long productId;
        private String productName;
        private int price;
        private int amount;
        private int totalItemPrice;

        public static OrderItemDto from(OrderItem item) {

            return OrderItemDto.builder()
                    .productId(item.getProduct().getId())
                    .productName(item.getProduct().getProductName())
                    .price(item.getOrderPrice())
                    .amount(item.getAmount())
                    .totalItemPrice(item.getOrderPrice() * item.getAmount())
                    .build();
        }
    }

    public static OrderResponse from(Order order) {
        // 주문명 생성 로직
        String name = "상품 정보 없음";
        if (!order.getOrderItems().isEmpty()) {
            name = order.getOrderItems().get(0).getProduct().getProductName();
            if (order.getOrderItems().size() > 1) {
                name += " 외 " + (order.getOrderItems().size() - 1) + "건";
            }
        }

        // 아이템 리스트 변환
        List<OrderItemDto> itemDtos = order.getOrderItems().stream()
                .map(OrderItemDto::from)
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .orderId(order.getId())
                .totalPrice(order.getTotalPrice())
                .orderName(name)
                .orderedAt(order.getOrderedAt())
                .status(order.getStatus())
                .items(itemDtos)
                .build();
    }
}
