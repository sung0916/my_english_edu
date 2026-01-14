package com.englishapp.api_server.entity;

import com.englishapp.api_server.domain.OrderStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderItem> orderItems = new ArrayList<>();

    @Column(name = "total_price")
    private int totalPrice;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private OrderStatus status;

    private LocalDateTime orderedAt;

    // 연관관계 편의 메서드
    public void addOrderItem(OrderItem orderItem) {
        orderItems.add(orderItem);
        orderItem.setOrder(this);
    }

    // 생성 메서드 (정적 팩토리 메서드 패턴)
    public static Order createOrder(User user, List<OrderItem> orderItems) {

        Order order = Order.builder()
                .user(user)
                .status(OrderStatus.PENDING)  // 결제 전이므로 PENDING 사용
                .orderedAt(LocalDateTime.now())
                .orderItems(new ArrayList<>())
                .build();

        int total = 0;
        for (OrderItem item : orderItems) {
            order.addOrderItem(item);
            total += (item.getOrderPrice() * item.getAmount());
        }
        order.totalPrice = total;  // Builder에 없으므로 별도 세팅

        return order;
    }

    public void changeStatus(OrderStatus newStatus) {
        if (this.status == OrderStatus.CANCELED || this.status == OrderStatus.REFUNDED) {
            throw new IllegalStateException("이미 취소/환불된 주문을 상태 변경 불가");
        }
        this.status = newStatus;
    }

    // (참고) Builder 패턴을 쓰셨다면 totalPrice 설정을 위해 setter를 열거나(지양),
    // Builder 내에서 계산하거나, 위처럼 생성 메서드에서 주입해야 합니다.
    // 여기서는 편의상 필드 직접 할당으로 표현했습니다.
}
