import apiClient from ".";

export interface PageResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    number: number;
}

export interface AdminOrderDto {
    orderId: number;
    orderName: string;
    totalPrice: number;
    buyerName: string;
    buyerEmail: string;
    paidAt: string;
    status: string;
    productType: 'ITEM' | 'SUBSCRIPTION' | 'MIXED';
}

// 주문 목록 조회
export const getAdminOrders = async (status?: string, type?: string, page = 0, size = 20): Promise<PageResponse<AdminOrderDto>> => {
    const response = await apiClient.get<PageResponse<AdminOrderDto>>('/api/admin/orders', {
        params: { status, type, page, size }
    });
    return response.data;
};

// 환불 승인
export const approveRefund = async (orderId: number) => {
    const response = await apiClient.post(`/api/admin/payments/${orderId}/refund-approve`);
    return response.data;
};
