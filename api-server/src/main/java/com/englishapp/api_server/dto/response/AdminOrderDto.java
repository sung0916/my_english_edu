package com.englishapp.api_server.dto.response;

import com.englishapp.api_server.entity.Order;
import lombok.Builder;
import lombok.Getter;

import java.time.format.DateTimeFormatter;

@Getter
@Builder
public class AdminOrderDto {

    private Long orderId;
    private String orderName;
    private int totalPrice;
    private String buyerName;
    private String buyerEmail;
    private String paidAt;
    private String status;
    private String productType;

    public static AdminOrderDto from(Order order) {
        // 주문명 생성
        String name = "No product data";
        String type = "MIXED"; // 기본값

        if (!order.getOrderItems().isEmpty()) {
            name = order.getOrderItems().get(0).getProduct().getProductName();
            type = order.getOrderItems().get(0).getProduct().getType().name();

            if (order.getOrderItems().size() > 1) {
                name += " and " + (order.getOrderItems().size() - 1) + "others";
                type = "MIXED";
            }
        }

        return AdminOrderDto.builder()
                .orderId(order.getId())
                .orderName(name)
                .totalPrice(order.getTotalPrice())
                .buyerName(order.getUser().getUsername())
                .buyerEmail(order.getUser().getEmail())
                .paidAt(order.getOrderedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")))
                .status(order.getStatus().name())
                .productType(type)
                .build();
    }
}
