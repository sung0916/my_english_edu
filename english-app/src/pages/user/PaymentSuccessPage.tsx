import { getOrderDetail, OrderResponse, startSubscription } from "@/api/paymentApi";
import { useEffect, useState } from "react";
import { IoCalendarNumber, IoCheckmarkCircle, IoClose, IoHome, IoLocationSharp } from "react-icons/io5";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function PaymentSuccessPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const orderId = searchParams.get("orderId");
    const [order, setOrder] = useState<OrderResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
    const [startDate, setStartDate] = useState("");

    useEffect(() => {
        if (!orderId) return;
        getOrderDetail(orderId)
            .then(data => {
                setOrder(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("주문 내역 조회 실패 : ", err);
                setLoading(false);
            });
    }, [orderId]);

    // 모달 열기
    const openDateModal = (itemId: number) => {
        setSelectedItemId(itemId);
        setStartDate(new Date().toISOString().split("T")[0]);
        setIsModalOpen(true);
    };

    // 수강 시작 요청
    const handleStartSubmit = async () => {
        if (!selectedItemId || !startDate) return;
        try {
            await startSubscription(selectedItemId, startDate);
            alert("Success applying your plan");
            setIsModalOpen(false);

        } catch (err) {
            console.error(err);
            setIsModalOpen(false);
        }
    };

    if (loading) return <div className="p-20 text-center">Loading your order info...</div>;
    if (!order) return <div className="p-20 text-center">Can not find your order</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-3xl mx-auto">
                
                {/* 1. 성공 헤더 */}
                <div className="bg-white rounded-t-2xl p-8 text-center border-b border-gray-100 shadow-sm">
                    <IoCheckmarkCircle className="text-green-500 text-6xl mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Success your order</h1>
                    {/* <p className="text-gray-500">주문번호: ORD-{order.orderId}</p> */}
                </div>

                {/* 2. 주문 상품 목록 */}
                <div className="bg-white p-6 shadow-sm border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Order List</h2>
                    <div className="space-y-4">
                        {order.items.map((item) => (
                            <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                                {/* 썸네일 */}
                                <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 mr-4 overflow-hidden">
                                    {item.thumbnailUrl ? (
                                        <img src={item.thumbnailUrl} alt={item.productName} className="w-full h-full object-cover"/>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Img</div>
                                    )}
                                </div>

                                {/* 상품 정보 */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                                            item.productType === 'SUBSCRIPTION' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                                        }`}>
                                            {item.productType === 'SUBSCRIPTION' ? 'Plan' : 'Goods'}
                                        </span>
                                        <h3 className="font-semibold text-gray-900">{item.productName}</h3>
                                    </div>
                                    <p className="text-sm text-gray-500">{item.price.toLocaleString()} ₩ / {item.amount}pcs</p>
                                </div>

                                {/* ⭐ 핵심 기능: 타입별 액션 버튼 */}
                                <div className="mt-3 sm:mt-0 sm:ml-4 w-full sm:w-auto">
                                    {item.productType === 'ITEM' ? (
                                        // A. 굿즈일 때: 픽업 안내
                                        <div className="flex items-start gap-2 bg-white p-3 rounded-lg border border-orange-100 text-sm text-gray-600 shadow-sm">
                                            <IoLocationSharp className="text-orange-500 text-lg flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-bold text-orange-600 mb-1">Where to pick up</p>
                                                <p className="text-xs text-gray-500 leading-relaxed">
                                                    서울 광진구 아차산로 463<br/>4층 데스크
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        // B. 수강권일 때: 시작일 설정 버튼
                                        <button 
                                            onClick={() => openDateModal(item.id)}
                                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg shadow-md transition-transform active:scale-95"
                                        >
                                            <IoCalendarNumber className="text-xl" />
                                            <span className="font-bold text-sm">When does it start?</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. 하단 홈 버튼 */}
                <div className="bg-gray-50 p-6 rounded-b-2xl text-center">
                    <button 
                        onClick={() => navigate("/")}
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium transition-colors"
                    >
                        <IoHome />
                        Go back home
                    </button>
                </div>
            </div>

            {/* 📅 모달: 시작 날짜 선택 */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 transform transition-all scale-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Select your start date</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <IoClose size={24} />
                            </button>
                        </div>
                        
                        <div className="mb-6">
                            <label className="block text-sm text-gray-600 mb-2">Choose below here</label>
                            <input 
                                type="date" 
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                            />
                            <p className="text-xs text-purple-500 mt-2 bg-purple-50 p-2 rounded">
                                * It will be counted from the selected date
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium"
                            >
                                Select later
                            </button>
                            <button 
                                onClick={handleStartSubmit}
                                className="flex-1 py-3 text-white bg-purple-600 hover:bg-purple-700 rounded-xl font-bold shadow-lg shadow-purple-200"
                            >
                                Proceed
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}