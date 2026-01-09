package com.englishapp.api_server.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "subscriptions")
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "subscription_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    // 혹시 몰라서 만든 횟수 차감제에 쓰일 필드(null 가능)
    @Column(name = "ticket_count")
    private Integer ticketCount;

    // 생성 메서드
    public static Subscription create(User user, Order order, Product product) {
        return Subscription.builder()
                .user(user)
                .order(order)
                .product(product)
                .build();
    }
}
