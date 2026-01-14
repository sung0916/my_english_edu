import apiClient from "./index";

// 백엔드 Enum 타입
export type ProductType = 'ITEM' | 'SUBSCRIPTION';

// 주문 상세 조회
export interface OrderItemDetail {
    id: number;
    productName: string;
    productType: ProductType;
    price: number;
    amount: number;
    thumbnailUrl?: string;
}

// 백엔드의 PaymentRequest.Verify와 매칭
export interface PaymentVerifyRequest {
    paymentId: string;
    merchantUid: string;    // 우리 서버 주문 번호 (ex: ORD-105)
    amount: number;         // 결제된 금액
    pgProvider: string;     // 결제사 정보 (kakaopay, toss 등)
}

// 백엔드: Order Response (주문 상세 조회 결과 - 백엔드 응답 구조에 맞춰 필드 작성)
export interface OrderResponse {
    orderId: number;
    orderName: string;      // ooo외 N건
    totalPrice: number;     // 총 결제 금액
    orderedAt: string;
    status: string;
    items: OrderItemDetail[];
}

// 마이페이지 주문 목록 조회
export const getMyOrders = async () => {
    const response = await apiClient.get<OrderResponse[]>('/api/orders');
    return response.data;
};

// 주문 상세 조회
export const getOrderDetail = async (orderId: string | number) => {
    const response = await apiClient.get<OrderResponse>(`/api/orders/${orderId}`);
    return response.data;
};

// 결제 검증
export const verifyPayment = async (data: PaymentVerifyRequest) => {

    // Controller에서 @ResquestBody로 받으므로 두 번째 인자에 data를 넣음
    const response = await apiClient.post('/api/payments/complete', data);
    return response.data;
};

// 수강권 시작일 설정
export const startSubscription = async (orderItemId: number, startDate: string) => {
    const response = await apiClient.patch(`/api/licenses/start-by-item`, {
        orderItemId,
        startDate
    });
    return response.data;
};
