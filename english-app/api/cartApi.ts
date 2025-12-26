import { CartItem } from "@/types/cart";
import apiClient from ".";

export const cartApi = {

    // 장바구니 목록 조회
    getMyCart: async (): Promise<CartItem[]> => {
        const response = await apiClient.get<CartItem[]>('/api/carts');
        return response.data;
    },

    // 장바구니 상품 추가
    addToCart: async (productId: number, amount: number): Promise<void> => {
        await apiClient.post('/api/carts/add', {
            productId,
            amount,
        });
    },

    // 장바구니 수량 변경
    updateCartAmount: async (cartId: number, amount: number): Promise<void> => {
        await apiClient.patch(`/api/carts/${cartId}`, {
            amount,
        });
    },

    // 장바구니 항목 삭제
    deleteCartItem: async (cartId: number): Promise<void> => {
        await apiClient.delete(`/api/carts/${cartId}`);
    }
};
