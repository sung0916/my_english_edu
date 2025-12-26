
export interface CartItem {
    cartId: number;
    productId: number;
    productName: string;
    price: number;
    amount: number;
    totalPrice: number;
    status: 'ONSALE' | 'NOTONSALE';
    thumbnailImageUrl: string | null;
}

// 스토어에서 사용할 타입 정의
export interface CartSummary {
    items: CartItem[];
    totalCartPrice: number;
}
