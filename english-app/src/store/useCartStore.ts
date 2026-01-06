import { cartApi } from "@/api/cartApi";
import { CartItem } from "@/types/cart";
import { create } from "zustand";

interface CartState {
    items: CartItem[];
    totalCartPrice: number;
    isLoading: boolean;

    // Actions
    fetchCart: () => Promise<void>;
    addToCart: (productId: number, amount: number) => Promise<void>;
    updateItemAmount: (cartId: number, newAmount: number) => Promise<void>;
    removeItem: (cartId: number) => Promise<void>;
    clearCart: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
    items: [],
    totalCartPrice: 0,
    isLoading: false,

    fetchCart: async () => {
        set({ isLoading: true });
        try {
            const items = await cartApi.getMyCart();
            const total = items.reduce((acc, item) => acc + item.totalPrice, 0);
            set({ items, totalCartPrice: total });

        } catch (err) { console.error('장바구니 조회 실패: ', err); }
        finally { set({ isLoading: false }); }
    },

    addToCart: async (productId: number, amount: number) => {
        set({ isLoading: true });
        try {
            await cartApi.addToCart(productId, amount);
            await get().fetchCart();

        } catch (err) { console.error('장바구니 담기 실패: ', err); throw err; }
        finally { set({ isLoading: false }); }
    },

    updateItemAmount: async (cartId: number, newAmount: number) => {
        try {
            await cartApi.updateCartAmount(cartId, newAmount);
            await get().fetchCart();  // 데이터 갱신
        } catch (err) { console.error(err); alert('Changing amount is failed'); }
    },

    removeItem: async (cartId: number) => {
        try {
            await cartApi.deleteCartItem(cartId);
            await get().fetchCart();
        } catch (err) { console.error('삭제 실패: ', err); }
    },

    clearCart: () => {
        set({ items: [], totalCartPrice: 0, isLoading: false });
    },
}));
