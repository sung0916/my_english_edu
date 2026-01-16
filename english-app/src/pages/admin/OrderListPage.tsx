import { useEffect, useState } from "react";
import { AdminOrderDto, getAdminOrders, approveRefund } from "@/api/adminApi";
import { Pagination } from "@/components/common/Pagination";

// 탭 정의
const TABS = [
    { id: 'ALL', label: 'All Orders' },
    { id: 'SUBSCRIPTION', label: 'Subscription' },
    { id: 'ITEM', label: 'Goods' },
    { id: 'REFUND', label: 'Refund Requests' }, 
];

// 환불 요청 내부 탭 (Pending / Accepted)
const REFUND_SUB_TABS = [
    { id: 'PENDING', label: 'Waiting' },
    { id: 'REFUNDED', label: 'Accepted' },
];

export default function AdminOrderListPage() {
    const [activeTab, setActiveTab] = useState('ALL');
    const [refundSubTab, setRefundSubTab] = useState('PENDING'); // 환불 탭일 때만 사용

    const [orders, setOrders] = useState<AdminOrderDto[]>([]);
    const [loading, setLoading] = useState(true);
    
    // 페이지네이션
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);

    // 데이터 로드
    const fetchOrders = async () => {
        setLoading(true);
        try {
            let statusParam = undefined;
            let typeParam = undefined;

            // 탭에 따른 파라미터 설정
            if (activeTab === 'SUBSCRIPTION') typeParam = 'SUBSCRIPTION';
            else if (activeTab === 'ITEM') typeParam = 'ITEM';
            else if (activeTab === 'REFUND') {
                // 환불 탭일 때는 서브 탭에 따라 상태 결정
                statusParam = refundSubTab === 'PENDING' ? 'REFUND_REQUESTED' : 'REFUNDED';
            }

            const response = await getAdminOrders(statusParam, typeParam, page - 1, 10);
            
            setOrders(response.content);
            setTotalPages(response.totalPages);
            setTotalItems(response.totalElements);
        } catch (error) {
            console.error("주문 목록 로드 실패", error);
        } finally {
            setLoading(false);
        }
    };

    // 탭이나 페이지가 바뀌면 다시 로드
    useEffect(() => {
        fetchOrders();
    }, [activeTab, refundSubTab, page]);

    // 환불 승인 핸들러
    const handleApproveRefund = async (orderId: number, orderName: string) => {
        if (!confirm(`[${orderName}] Do you approve the order refund?\nPayment will be cancelled immediately`)) return;

        try {
            await approveRefund(orderId);
            alert("Refund accepted");
            fetchOrders(); // 목록 새로고침
        } catch (error) {
            console.error(error);
            alert("Failed to accept");
        }
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-sm h-full flex flex-col min-w-[1000px]">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Ordered History</h1>

            {/* 1. 메인 카테고리 탭 */}
            <div className="flex border-b border-gray-200 mb-6">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id); setPage(1); }}
                        className={`px-6 py-3 font-medium text-sm transition-colors relative ${
                            activeTab === tab.id 
                            ? 'text-blue-600 border-b-2 border-blue-600' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* 2. 환불 요청일 때만 보이는 서브 탭 */}
            {activeTab === 'REFUND' && (
                <div className="flex gap-2 mb-6">
                    {REFUND_SUB_TABS.map(sub => (
                        <button
                            key={sub.id}
                            onClick={() => { setRefundSubTab(sub.id); setPage(1); }}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                                refundSubTab === sub.id
                                ? 'bg-red-100 text-red-600'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                        >
                            {sub.label}
                        </button>
                    ))}
                </div>
            )}

            {/* 3. 테이블 */}
            <div className="flex-1 overflow-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-y border-gray-200 text-gray-600 text-sm text-center">
                            <th className="py-3 px-4 w-20">No</th>
                            <th className="py-3 px-4">Product Name</th>
                            <th className="py-3 px-4 w-32">Total Price</th>
                            <th className="py-3 px-4 w-40">Purchaser</th>
                            <th className="py-3 px-4 w-32">Paid At</th>
                            <th className="py-3 px-4 w-24">Status</th>
                            {activeTab === 'REFUND' && refundSubTab === 'PENDING' && (
                                <th className="py-3 px-4 w-24">Action</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} className="py-20 text-center text-gray-400">Loading...</td></tr>
                        ) : orders.length === 0 ? (
                            <tr><td colSpan={7} className="py-20 text-center text-gray-400">내역이 없습니다.</td></tr>
                        ) : (
                            orders.map((order) => (
                                <tr key={order.orderId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                    <td className="py-3 px-4 text-center text-gray-500">{order.orderId}</td>
                                    <td className="py-3 px-4 font-medium text-gray-800">{order.orderName}</td>
                                    <td className="py-3 px-4 text-center font-bold text-gray-800">
                                        {order.totalPrice.toLocaleString()} ₩
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <div className="text-gray-900 text-sm">{order.buyerName}</div>
                                        <div className="text-gray-400 text-xs">{order.buyerEmail}</div>
                                    </td>
                                    <td className="py-3 px-4 text-center text-sm text-gray-500">
                                        {new Date(order.paidAt).toLocaleDateString()}
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                                            order.status === 'PAID' ? 'bg-green-100 text-green-700' :
                                            order.status === 'REFUND_REQUESTED' ? 'bg-red-100 text-red-600' :
                                            order.status === 'REFUNDED' ? 'bg-gray-200 text-gray-600' :
                                            'bg-gray-100 text-gray-500'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    
                                    {/* 환불 대기 상태일 때만 '승인' 버튼 노출 */}
                                    {activeTab === 'REFUND' && refundSubTab === 'PENDING' && (
                                        <td className="py-3 px-4 text-center">
                                            <button 
                                                onClick={() => handleApproveRefund(order.orderId, order.orderName)}
                                                className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded shadow-sm transition-colors"
                                            >
                                                Approve
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* 페이지네이션 */}
            <div className="mt-4 flex justify-center">
                <Pagination
                    currentPage={page}
                    totalItems={totalItems}
                    itemsPerPage={10}
                    onPageChange={setPage}
                />
            </div>
        </div>
    );
}
