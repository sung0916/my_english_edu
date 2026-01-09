package com.englishapp.api_server.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "order_items")
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_item_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    private int amount;

    @Column(name = "order_price")
    private int orderPrice;

    // 오더 생성 메서드
    public static OrderItem createOrderItem(Product product, int amount) {

        product.removeStock(amount);

        return OrderItem.builder()
                .product(product)
                .amount(amount)
                .orderPrice(product.getPrice())
                .build();
    }

    // Order 설정 (연관관계 편의 메서드용)
    public void setOrder(Order order) {
        this.order = order;
    }
}
