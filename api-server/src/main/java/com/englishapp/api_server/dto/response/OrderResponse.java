package com.englishapp.api_server.dto.response;

import com.englishapp.api_server.domain.OrderStatus;
import com.englishapp.api_server.domain.ProductType;
import com.englishapp.api_server.entity.Order;
import com.englishapp.api_server.entity.OrderItem;
import com.englishapp.api_server.entity.Payment;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Getter
@Builder
public class OrderResponse {

    private Long orderId;
    private int totalPrice;
    private String orderName;  // "OOO외 N건"
    private LocalDateTime orderedAt;
    private OrderStatus status;

    private String buyerName;
    private String buyerEmail;
    private String buyerTel;
    private String payMethod;

    private List<OrderItemDto> items;  // 상세 조회를 위한 아이템 리스트 (필요 시 사용)

    public static OrderResponse from(Order order, Map<Long, String> thumbnailMap, Map<Long, Payment> paymentMap) {
        // 주문명 생성 로직
        String name = "상품 정보 없음";
        List<OrderItem> items = order.getOrderItems();
        if (!items.isEmpty()) {
            name =  items.get(0).getProduct().getProductName();
            if (items.size() > 1) {
                name += " 외 " + (items.size() - 1) + "건";
            }
        }

        // 아이템 리스트 변환 (Map에서 이미지 URL 꺼내기)
        List<OrderItemDto> itemDtos = items.stream()
                .map(item -> {
                    String imgUrl = thumbnailMap.get(item.getProduct().getId());
                    return OrderItemDto.from(item, imgUrl);
                })
                .collect(Collectors.toList());

        // 결제 정보 찾기
        Payment payment = paymentMap.get(order.getId());
        String methodText = "결제 정보 없음";
        if (payment != null) {
            methodText = convertProviderToText(payment.getPgProvider());
        }

        return OrderResponse.builder()
                .orderId(order.getId())
                .totalPrice(order.getTotalPrice())
                .orderName(name)
                .orderedAt(order.getOrderedAt())
                .status(order.getStatus())
                .items(itemDtos)
                .buyerName(order.getUser().getUsername())
                .buyerEmail(order.getUser().getEmail())
                .buyerTel(order.getUser().getTel())
                .payMethod(methodText)
                .build();
    }

    // 내부 클래스로 아이템 정보 정의
    @Getter
    @Builder
    public static class OrderItemDto {
        private Long id;
        private Long productId;
        private String productName;
        private ProductType productType;  // 프론트엔드 로직 분기용
        private int price;
        private int amount;
        private String thumbnailUrl;
        // private int totalItemPrice;

        public static OrderItemDto from(OrderItem item, String thumbnailUrl) {
            return OrderItemDto.builder()
                    .id(item.getId())
                    .productId(item.getProduct().getId())
                    .productName(item.getProduct().getProductName())
                    .productType(item.getProduct().getType())
                    .price(item.getOrderPrice())
                    .amount(item.getAmount())
                    .thumbnailUrl(thumbnailUrl)
                    .build();
        }
    }

    // PG사 코드를 한글로 변환하는 메서드
    private static String convertProviderToText(String pgProvider) {
        if (pgProvider == null) return "간편 결제";
        switch (pgProvider.toLowerCase()) {
            case "html5_inicis": return "Credit Card";
            case "kakaopay": return "KakaoPay";
            case "tosspay": return "TossPay";
            case "naverpay": return "NaverPay";
            case "danal": return "MobilePay";
            default: return pgProvider;
        }
    }
}
