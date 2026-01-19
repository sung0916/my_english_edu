import { getMyOrders, OrderResponse } from "@/api/paymentApi";
import { Pagination } from "@/components/common/Pagination";
import { useEffect, useState } from "react";
import { IoChevronForward, IoReceiptOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

const ITEMS_PER_PAGE = 10;

// 주문 상태 한글 매핑
const STATUS_MAP: Record<string, { label: string; color: string }> = {
    PENDING: { label: "Pending", color: "bg-gray-100 text-gray-600" },
    PAID: { label: "Paid", color: "bg-green-100 text-green-700" },
    CANCELED: { label: "Canceled", color: "bg-red-100 text-red-600" },
    REFUNDED: { label: "Refunded", color: "bg-orange-100 text-orange-600" },
};

const MyOrderListPage = () => {
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [currentPage, setCurrentPage] = useState(1);

    // 1. 데이터 로드
    useEffect(() => {
        const fetchOrders = async () => {
            setIsLoading(true);
            try {
                const data = await getMyOrders();
                setOrders(data);
            } catch (error) {
                console.error("주문 내역 로드 실패:", error);
                alert("Can not found your orders");
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrders();
    }, []);

    // 2. 클라이언트 사이드 페이지네이션 계산
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentOrders = orders.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);

    // 3. 상세 페이지 이동 핸들러
    const handleRowClick = (orderId: number) => {
        navigate(`/user/orderDetail?orderId=${orderId}`);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm h-full flex flex-col min-h-[600px] min-w-[925px]">
            <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <IoReceiptOutline />
                Order History
            </h1>

            {/* 테이블 헤더 */}
            <div className="flex flex-row bg-gray-50 border-y border-gray-200 py-4 px-2 font-bold text-gray-700 text-center text-sm">
                <div className="w-20 md:w-24">No</div>
                <div className="flex-[4] text-left pl-4">Product</div>
                <div className="hidden md:block w-32">Price</div>
                <div className="w-28">Paid at</div>
                <div className="w-24">Status</div>
                <div className="w-10"></div>
            </div>

            {/* 테이블 바디 */}
            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="py-20 text-center text-gray-500">Loading list...</div>
                ) : orders.length === 0 ? (
                    <div className="py-20 text-center text-gray-400 flex flex-col items-center gap-2">
                        <IoReceiptOutline size={48} className="text-gray-200"/>
                        <p>Not found</p>
                    </div>
                ) : (
                    currentOrders.map((item) => {
                        const statusInfo = STATUS_MAP[item.status] || { label: item.status, color: "bg-gray-100" };
                        
                        return (
                            <div 
                                key={item.orderId} 
                                className="flex flex-row items-center border-b border-gray-100 py-4 px-2 hover:bg-blue-50 transition-colors cursor-pointer group"
                                onClick={() => handleRowClick(item.orderId)}
                            >
                                {/* 주문번호 */}
                                <div className="w-20 md:w-24 text-center text-gray-500 text-xs md:text-sm">
                                    {item.orderId}
                                </div>

                                {/* 상품명 (제목) */}
                                <div className="flex-[4] px-4">
                                    <div className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                                        {item.orderName}
                                    </div>
                                    {/* 모바일에서만 보이는 금액 */}
                                    <div className="md:hidden text-xs text-blue-600 font-bold mt-1">
                                        {item.totalPrice.toLocaleString()} ₩
                                    </div>
                                </div>

                                {/* 결제금액 (PC) */}
                                <div className="hidden md:block w-32 text-center font-bold text-gray-800">
                                    {item.totalPrice.toLocaleString()} ₩
                                </div>

                                {/* 날짜 */}
                                <div className="w-28 text-center text-gray-500 text-xs md:text-sm">
                                    {new Date(item.orderedAt).toLocaleDateString()}
                                </div>

                                {/* 상태 뱃지 */}
                                <div className="w-24 flex justify-center">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusInfo.color}`}>
                                        {statusInfo.label}
                                    </span>
                                </div>

                                {/* 화살표 아이콘 */}
                                <div className="w-10 flex justify-center text-gray-300 group-hover:text-blue-400">
                                    <IoChevronForward />
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* 페이지네이션 */}
            <div className="mt-6 flex justify-center">
                {orders.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalItems={orders.length}
                        itemsPerPage={ITEMS_PER_PAGE}
                        onPageChange={setCurrentPage}
                    />
                )}
            </div>
        </div>
    );
};

export default MyOrderListPage;