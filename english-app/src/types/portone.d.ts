export { };

declare global {
  interface Window {
    PortOne: {
      requestPayment: (options: PaymentRequestOptions) => Promise<PortOnePaymentResponse>;
    };
  }
}

export interface PaymentRequestOptions {
  storeId: string;
  channelKey: string;
  paymentId: string;
  orderName: string;
  totalAmount: number;
  currency: string;
  payMethod: string;
  easyPay?: {
    provider: string;
  };
  customer?: {
    fullName?: string;
    phoneNumber?: string;
    email?: string;
  };
  windowType?: {
    pc?: 'IFRAME' | 'POPUP';
    mobile?: 'IFRAME' | 'POPUP';
  };
  redirectUrl?: string;
}

export interface PortOnePaymentResponse {
  paymentId: string;
  transactionId: string;
  code?: string; // 실패 시 존재
  message?: string; // 실패 메시지
  // 성공 시 추가 필드들이 올 수 있음
}
