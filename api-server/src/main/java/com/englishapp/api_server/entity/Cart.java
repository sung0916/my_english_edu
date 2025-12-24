package com.englishapp.api_server.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "carts")
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cart_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private int amount;

    // 수량 변경 메서드 (Dirty Checking 용)
    public void updateAmount(int amount) {
        this.amount = amount;
    }

    // 수량 증가 메서드 (같은 상품 담았을 때)
    public void addAmount(int amount) {
        this.amount += amount;
    }
}
