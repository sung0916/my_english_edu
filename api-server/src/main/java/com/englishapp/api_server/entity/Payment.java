package com.englishapp.api_server.entity;

import com.englishapp.api_server.domain.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    @Column(name = "pg_provider")
    private String pgProvider;  // 토스, 카카오페이 등

    @Column(name = "pg_tid")
    private String pgTid;  // PG사 거래 고유 번호

    @Enumerated(EnumType.STRING)
    private PaymentStatus status;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    // 결제 성공 메서드
    public void succeed(String pgTid) {
        this.status = PaymentStatus.PAID;
        this.pgTid = pgTid;
        this.paidAt = LocalDateTime.now();
    }
}
