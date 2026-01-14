
export interface OrderSummaryType {
    orderId: number;
    orderName: string;     // ooo외 N건
    totalAmount: number;   // 총 결제 금액

    // 구매자 정보 (결제창에 미리 채워주기 위해)
    buyerName: string;
    buyerEmail: string;
    buyerTel: string;
}

export type PaymentMethodType = 'KAKAO' | 'TOSS' | 'CARD' | 'MOBILE';
