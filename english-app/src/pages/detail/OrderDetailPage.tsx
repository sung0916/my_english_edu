import { getOrderDetail, OrderResponse, requestRefund, startSubscription } from "@/api/paymentApi";
import { useEffect, useState } from "react";
import { IoCalendarNumber, IoChevronBack, IoClose, IoLocationSharp } from "react-icons/io5";
import { useNavigate, useSearchParams } from "react-router-dom";

// 상태 한글 변환 맵
const STATUS_MAP: Record<string, string> = {
    PENDING: "Pending",
    PAID: "Paid",
    CANCELED: "Canceled",
    REFUNDED: "Refunded",
};

export default function OrderDetailPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const orderId = searchParams.get("orderId");

    const [order, setOrder] = useState<OrderResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
    const [refundReason, setRefundReason] = useState("");

    // 모달 관련 상태
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
    const [startDate, setStartDate] = useState("");

    useEffect(() => {
        if (!orderId) {
            alert("Not allowed access");
            navigate(-1);
            return;
        }

        getOrderDetail(orderId)
            .then((data) => {
                setOrder(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                alert("Can not load order");
                navigate(-1);
            });
    }, [orderId, navigate]);

    // 수강권 날짜 설정 모달 열기
    const openDateModal = (itemId: number) => {
        setSelectedItemId(itemId);
        setStartDate(new Date().toISOString().split("T")[0]);
        setIsModalOpen(true);
    };

    // 수강 시작 API 호출
    const handleStartSubmit = async () => {
        if (!selectedItemId || !startDate) return;
        const isConfirmed = window.confirm(
            "Active license will not be able to refunded.\nAre you sure to proceed?"
        );
        if (!isConfirmed) return;
        try {
            await startSubscription(selectedItemId, startDate);
            alert("Success to apply start date");
            setIsModalOpen(false);
            navigate('/user/licenses');
        } catch (error) {
            console.error(error);
            alert("Failed to apply start date");
        }
    };

    // 환불 요청 모달
    const handleRefundClick = () => {
        if (order?.status === 'REFUND_REQUESTED') {
            alert("이미 환불 요청이 접수되었습니다.");
            return;
        }
        setRefundReason(""); // 초기화
        setIsRefundModalOpen(true);
    };

    // 환불 요청 전송
    const submitRefundRequest = async () => {
        if (!refundReason.trim()) return;

        try {
            await requestRefund(order!.orderId, refundReason);
            alert("환불 요청이 접수되었습니다. 관리자 확인 후 처리됩니다.");
            setIsRefundModalOpen(false);
            window.location.reload();
        } catch (error) {
            console.error(error);
            alert("환불 요청 처리에 실패했습니다.");
        }
    };

    if (loading) return <div className="p-20 text-center">Loading...</div>;
    if (!order) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* 0. 상단 네비게이션 */}
                <div className="flex items-center gap-2 mb-4">
                    <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-black">
                        <IoChevronBack size={24} />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Order</h1>
                </div>

                {/* 1. 주문 번호 및 날짜 헤더 */}
                <div className="bg-white p-6 rounded-t-lg border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
                        <span className="text-xl font-bold text-gray-900">
                            {new Date(order.orderedAt).toLocaleDateString()}
                        </span>
                        <span className="ml-1 text-sm text-gray-500">
                            No. {order.orderId}
                        </span>
                    </div>
                </div>

                {/* 2. 상품 목록 (카드형) */}
                <div className="bg-white rounded-b-lg shadow-sm border border-gray-200 overflow-hidden">
                    {order.items.map((item) => (
                        <div key={item.productId} className="p-6 border-b border-gray-100 last:border-0">

                            {/* 배송 상태 / 도착 예정일 (가상) */}
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="font-bold text-green-600 text-lg mr-2">
                                        {STATUS_MAP[order.status] || order.status}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                {/* 썸네일 */}
                                <div className="w-24 h-24 bg-gray-100 rounded-md flex-shrink-0 overflow-hidden border border-gray-200">
                                    {item.thumbnailUrl ? (
                                        <img src={item.thumbnailUrl} alt={item.productName} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No Img</div>
                                    )}
                                </div>

                                {/* 상품 정보 */}
                                <div className="flex-1">
                                    <div className="text-gray-900 font-medium mb-1">
                                        {item.productName}
                                    </div>
                                    <div className="text-gray-500 text-sm mb-4">
                                        {item.price.toLocaleString()} ₩ • {item.amount}pcs
                                    </div>

                                    {/* 교재일 경우 픽업 장소 안내 */}
                                    {item.productType === 'ITEM' && (
                                        <div className="flex items-start gap-1 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                            <IoLocationSharp className="text-orange-500 mt-0.5" />
                                            <span>Pickup: 서울 광진구 아차산로 463 4층</span>
                                        </div>
                                    )}
                                </div>

                                {/* 우측 버튼 그룹 */}
                                <div className="w-full sm:w-40 flex flex-col gap-2">
                                    <button
                                        className={`w-full py-2 border rounded text-sm transition-colors ${order?.status === 'REFUND_REQUESTED'
                                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                            }`}
                                        onClick={handleRefundClick} // 함수 교체
                                        disabled={order?.status === 'REFUND_REQUESTED' || order?.status === 'REFUNDED'}
                                    >
                                        {order?.status === 'REFUND_REQUESTED' ? '요청 심사중' : 'Refund Request'}
                                    </button>

                                    {/* 구독권 전용 버튼 */}
                                    {item.productType === 'SUBSCRIPTION' && (
                                        <button
                                            onClick={() => openDateModal(item.productId)}
                                            className="w-full py-2 bg-blue-600 border border-blue-600 rounded text-sm text-white hover:bg-blue-700 font-medium flex items-center justify-center gap-1 transition-colors"
                                        >
                                            <IoCalendarNumber />
                                            Set your start date
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 3. 받는사람 정보 (주문자 정보) */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">Purchaser Info</h2>
                    <div className="space-y-3 text-sm">
                        <div className="flex">
                            <span className="w-24 text-gray-500 font-medium">Purchaser</span>
                            <span className="text-gray-900">{order.buyerName}</span>
                        </div>
                        <div className="flex">
                            <span className="w-24 text-gray-500 font-medium">Contact</span>
                            <span className="text-gray-900">{order.buyerTel}</span>
                        </div>
                        <div className="flex">
                            <span className="w-24 text-gray-500 font-medium">Email</span>
                            <span className="text-gray-900">{order.buyerEmail}</span>
                        </div>
                        <div className="flex">
                            <span className="w-24 text-gray-500 font-medium">Pickup</span>
                            <span className="text-gray-900">Self-pickup  |  Select date</span>
                        </div>
                    </div>
                </div>

                {/* 4. 결제 정보 */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">결제 정보</h2>

                    <div className="flex flex-col md:flex-row justify-between gap-6">
                        {/* 결제 수단 */}
                        <div className="flex-1 space-y-3 text-sm">
                            <div className="flex">
                                <span className="w-24 text-gray-500 font-medium">Paid by</span>
                                <span className="text-gray-900 font-medium">{order.payMethod}</span>
                            </div>
                            <div className="flex">
                                <span className="w-24 text-gray-500 font-medium">Receipt</span>
                                <button className="text-blue-600 hover:underline text-left font-bold">
                                    Check
                                </button>
                            </div>
                        </div>

                        {/* 금액 정보 */}
                        <div className="flex-1 bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                            <span className="font-bold text-gray-900">Total price</span>
                            <span className="font-bold text-red-600 text-xl ml-8">
                                {order.totalPrice.toLocaleString()} ₩
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 환불 입력 모달 */}
            {isRefundModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 transform transition-all scale-100">
                        {/* 헤더 */}
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Refund form</h3>
                            <button onClick={() => setIsRefundModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <IoClose size={24} />
                            </button>
                        </div>
                        
                        {/* 내용 */}
                        <p className="text-sm text-gray-600 mb-4">
                            Please enter your reason for refund
                        </p>
                        
                        <textarea
                            value={refundReason}
                            onChange={(e) => setRefundReason(e.target.value)}
                            placeholder="Write here"
                            className="w-full h-32 border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none mb-6"
                        />

                        {/* 버튼 */}
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setIsRefundModalOpen(false)}
                                className="flex-1 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={submitRefundRequest}
                                disabled={refundReason.trim().length === 0} // 👈 글자 없으면 비활성화
                                className={`flex-1 py-3 text-white rounded-xl font-bold shadow-lg transition-colors ${
                                    refundReason.trim().length === 0
                                    ? 'bg-gray-300 cursor-not-allowed shadow-none' // 비활성 스타일
                                    : 'bg-red-500 hover:bg-red-600 shadow-red-200' // 활성 스타일
                                }`}
                            >
                                Proceed
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 날짜 설정 모달 */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-gray-900">Select date for your license get active</h3>
                            <button onClick={() => setIsModalOpen(false)}>
                                <IoClose size={24} className="text-gray-400" />
                            </button>
                        </div>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-6 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <div className="flex gap-2">
                            <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-gray-100 rounded-lg font-medium text-gray-600">Cancel</button>
                            <button onClick={handleStartSubmit} className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-bold">Proceed</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
