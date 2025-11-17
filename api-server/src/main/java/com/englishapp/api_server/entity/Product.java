package com.englishapp.api_server.entity;

import com.englishapp.api_server.domain.ProductStatus;
import com.englishapp.api_server.domain.ProductType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "product")
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id")
    private Long id;

    @Column(name = "product_name", nullable = false)
    private String productName;

    @Column(nullable = false)
    private int price;

    @Column
    private int amount;

    @Column(name = "sales_volume", nullable = false)
    private int salesVolume = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "product_type", nullable = false)
    private ProductType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "product_status", nullable = false)
    private ProductStatus status = ProductStatus.ONSALE;

    public void update(String productName,
                       Integer price,
                       Integer amount,
                       ProductType type,
                       ProductStatus status) {
        if (productName != null) {
            this.productName = productName;
        }
        if (price != null) {
            this.price = price;
        }
        if (amount != null) {
            this.amount = amount;
        }
        if (type != null) {
            this.type = type;
        }
        if (status != null) {
            this.status = status;
        }
    }

    // 판매량 증가 메서드
    public void increaseSalesVolume(int quantity) {
        if (quantity > 0) {
            this.salesVolume += quantity;
        }
    }
}
