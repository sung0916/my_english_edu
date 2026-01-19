import { getOrderDetail, verifyPayment } from "@/api/paymentApi";
import { useUserStore } from "@/store/userStore";
import { PORTONE_CONFIG } from "@/types/constants/payment";
import { PaymentMethodType } from "@/types/payment";
import { useEffect, useState } from "react";
import { IoCardOutline, IoPhonePortraitOutline, IoRadioButtonOff, IoRadioButtonOn } from "react-icons/io5";
import { useNavigate, useSearchParams } from "react-router-dom";

// 로고 URL 모음
const PAYMENT_LOGOS = {
    TOSS: "/payment/tosspay.png",
    KAKAO: '/payment/kakaopay.png',
    SAMSUNG: '/payment/samsungpay.png',
    CARD: "https://cdn-icons-png.flaticon.com/512/6963/6963703.png",
};

export default function CheckoutPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const orderIdParam = searchParams.get('orderId');

    const { user, isLoggedIn } = useUserStore();
    const [orderData, setOrderData] = useState<{ name: string; price: number } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // 1. 초기 데이터 로드
    useEffect(() => {
        if (!isLoggedIn || !user) {
            alert('Please login first');
            navigate('/auth/login');
            return;
        }
        if (!orderIdParam) {
            alert('Not allowed access');
            navigate('/');
            return;
        }

        const fetchOrder = async () => {
            try {
                const data = await getOrderDetail(orderIdParam);
                setOrderData({ name: data.orderName, price: data.totalPrice });
            } catch (err) {
                console.error('주문 조회 실패', err);
                alert('Can not load order list');
                navigate(-1);
            }
        };
        fetchOrder();
    }, [orderIdParam, isLoggedIn, user, navigate]);

    // 2. 결제 요청 함수 (심플해짐 💫)
    const handlePayment = async () => {
        if (!orderData || !user) return;
        if (!window.PortOne) {
            alert("Failed to load payment module\nPlease refresh");
            return;
        }

        setIsLoading(true);

        try {
            const paymentId = crypto.randomUUID();
            const finalParams = {
                storeId: PORTONE_CONFIG.STORE_ID,
                channelKey: PORTONE_CONFIG.CHANNEL_KEY,
                paymentId: paymentId,
                orderName: orderData.name,
                totalAmount: orderData.price,
                currency: "CURRENCY_KRW",
                payMethod: "CARD", // 이니시스 통합 결제창 호출
                customer: {
                    fullName: user.username,
                    phoneNumber: user.tel,
                    email: user.email,
                },
                windowType: {
                    pc: 'IFRAME',
                    mobile: 'POPUP'
                }
            } as any;

            const response = await window.PortOne.requestPayment(finalParams);

            if (response.code != null) {
                alert(`Failed payment : ${response.message}`);
                setIsLoading(false);
                return;
            }

            // 백엔드 검증 (PG사는 inicis로 고정)
            const verifyData = {
                paymentId: paymentId,                // 포트원 조회용 UUID
                merchantUid: `ORD-${orderIdParam}`,  // DB 조회용 주문번호
                amount: orderData.price,
                pgProvider: 'html5_inicis'
            };

            await verifyPayment(verifyData);
            navigate(`/payment/success?orderId=${orderIdParam}`);

        } catch (error: any) {
            console.error("에러 발생:", error);
            alert(`Error in payment process : ${error.message || error}`);
        } finally {
            setIsLoading(false);
        }
    };

    if (!orderData || !user) return <div className="p-20 text-center">주문 정보를 불러오는 중...</div>;

    return (
        <div className="bg-gray-50 min-h-screen py-12 px-4">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Payment Page</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* [LEFT] 정보 영역 */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* 1. 구매자 정보 */}
                        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-3">Purchaser</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="block text-gray-500 mb-1">Name</span>
                                    <div className="font-medium text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-100">{user.username}</div>
                                </div>
                                <div>
                                    <span className="block text-gray-500 mb-1">Tel</span>
                                    <div className="font-medium text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-100">{user.tel}</div>
                                </div>
                                <div className="md:col-span-2">
                                    <span className="block text-gray-500 mb-1">Email</span>
                                    <div className="font-medium text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-100">{user.email}</div>
                                </div>
                            </div>
                        </section>

                        {/* 2. 결제 정보 (심플하게 변경됨) */}
                        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-3">Payment Method</h2>

                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-5">
                                <h3 className="text-blue-900 font-semibold mb-2">Methods</h3>
                                <p className="text-sm text-blue-700 mb-4">
                                    Use Easy pay or Credit card
                                </p>

                                {/* 지원하는 결제수단 아이콘 나열 */}
                                <div className="flex items-center gap-3 flex-wrap">
                                    <div className="bg-white p-2 rounded-md shadow-sm border border-blue-100" title="TossPay">
                                        <img src={PAYMENT_LOGOS.TOSS} alt="Toss" className="h-6 object-contain scale-[2.0]" />
                                    </div>
                                    <div className="bg-white p-2 rounded-md shadow-sm border border-blue-100" title="KakaoPay">
                                        <img src={PAYMENT_LOGOS.KAKAO} alt="Kakao" className="h-6 object-contain" />
                                    </div>
                                    <div className="bg-white w-20 p-2 rounded-md shadow-sm border border-blue-100 flex justify-center items-center gap-1" title="SamsungPay">
                                        <img src={PAYMENT_LOGOS.SAMSUNG} alt="Samsung" className="h-6 object-contain scale-[2.0]" />
                                    </div>
                                    <div className="bg-white p-2 rounded-md shadow-sm border border-blue-100 flex items-center gap-1" title="Credit card">
                                        <img src={PAYMENT_LOGOS.CARD} alt="Card" className="h-6 object-contain" />
                                        <span className="text-xs text-gray-500 font-medium">Credit card</span>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* [RIGHT] 결제 요약 (Sticky) */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 space-y-4">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h2 className="text-lg font-bold text-gray-800 mb-4">Products</h2>
                                <div className="text-gray-600 text-sm mb-2">{orderData.name}</div>
                                <div className="border-t border-gray-100 my-4"></div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-500">Price</span>
                                    <span className="font-medium">{orderData.price.toLocaleString()} ₩</span>
                                </div>
                                <div className="border-t border-gray-100 my-4"></div>
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold text-gray-800">Total price</span>
                                    <span className="text-2xl font-bold text-blue-600">{orderData.price.toLocaleString()} ₩</span>
                                </div>
                            </div>

                            <button
                                onClick={handlePayment}
                                disabled={isLoading}
                                className={`w-full py-4 text-lg font-bold text-white rounded-xl shadow-lg transition-all transform active:scale-[0.99]
                                    ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}
                                `}
                            >
                                {isLoading ? '결제창 띄우기...' : 'Proceed'}
                            </button>
                            <p className="text-xs text-gray-400 text-center mt-2">
                                I have reviewed the order details above and agree to the payment.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
