package com.englishapp.api_server.entity;

import com.englishapp.api_server.domain.LicensePeriod;
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
    @Builder.Default
    private int salesVolume = 0;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "product_type", nullable = false)
    private ProductType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "license_period")
    private LicensePeriod licensePeriod;

    @Enumerated(EnumType.STRING)
    @Column(name = "product_status", nullable = false)
    @Builder.Default
    private ProductStatus status = ProductStatus.ONSALE;

    public void update(String productName,
                       Integer price,
                       Integer amount,
                       String description,
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
        if (description != null) {
            this.description = description;
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

    // OrderItem이 생성될 때 재고량 감소 메서드
    public void removeStock(int quantity) {
        int restStock = this.amount - quantity;
        if (restStock < 0) {
            throw new IllegalStateException("재고량 부족함");  // TODO: 커스텀 Exception 추가
        }

        this.amount = restStock;
        this.increaseSalesVolume(quantity);
    }

    // 판매 취소 시 재고 복구
    public void addStock(int quantity) {
        this.amount += quantity;
    }
}
