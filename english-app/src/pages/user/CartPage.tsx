import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "@/store/useCartStore";
import { useUserStore } from "@/store/userStore";
import { CartItem } from "@/types/cart";
import { 
    IoCheckbox, 
    IoSquareOutline, 
    IoClose,
    IoRadioButtonOn,
    IoRadioButtonOff
} from "react-icons/io5";

// 숫자 포맷 함수
const formatPrice = (price: number) => price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

type PaymentMethod = 'TOSS' | 'KAKAO' | 'CARD' | 'MOBILE';

export default function CartPage() {
    const navigate = useNavigate();
    const { isLoggedIn } = useUserStore();
    const { items, fetchCart, updateItemAmount, removeItem } = useCartStore();

    const [isLoading, setIsLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('TOSS');

    // 1. 초기 데이터 로드
    useEffect(() => {
        if (!isLoggedIn) {
            alert('로그인이 필요합니다.');
            navigate('/auth/login');
            return;
        }
        const load = async () => {
            setIsLoading(true);
            await fetchCart();
            setIsLoading(false);
        };
        load();
    }, [isLoggedIn, navigate, fetchCart]);

    // 2. 데이터 로드 후 '판매중'인 상품만 기본 전체 선택
    useEffect(() => {
        if (items.length > 0) {
            const validIds = items
                .filter(item => item.status === 'ONSALE')
                .map(item => item.cartId);
            setSelectedIds(new Set(validIds));
        }
    }, [items]);

    // --- 로직 ---
    const handleSelectAll = () => {
        const validItems = items.filter(item => item.status === 'ONSALE');
        if (selectedIds.size === validItems.length) {
            setSelectedIds(new Set());
        } else {
            const allIds = validItems.map(item => item.cartId);
            setSelectedIds(new Set(allIds));
        }
    };

    const handleToggleItem = (cartId: number, status: string) => {
        if (status !== 'ONSALE') return;
        const newSet = new Set(selectedIds);
        if (newSet.has(cartId)) newSet.delete(cartId);
        else newSet.add(cartId);
        setSelectedIds(newSet);
    };

    const handleDeleteSelected = async () => {
        if (selectedIds.size === 0) return alert("삭제할 상품을 선택해주세요.");
        if (!window.confirm(`${selectedIds.size}개 상품을 삭제하시겠습니까?`)) return;

        try {
            const deletePromises = Array.from(selectedIds).map(id => removeItem(id));
            await Promise.all(deletePromises);
            setSelectedIds(new Set());
        } catch (error) {
            console.error("삭제 중 오류", error);
        }
    };

    const handleQuantityChange = async (cartId: number, currentAmount: number, change: number) => {
        const newAmount = currentAmount + change;
        if (newAmount < 1) return; // 최소 1개 유지
        await updateItemAmount(cartId, newAmount);
    };

    const { finalPrice } = useMemo(() => {
        const selectedItems = items.filter(item => selectedIds.has(item.cartId));
        const total = selectedItems.reduce((sum, item) => sum + item.totalPrice, 0);
        return { finalPrice: total };
    }, [items, selectedIds]);

    // --- [수정된 부분] 렌더링: 개별 아이템 (UI 디자인 변경) ---
    const CartItemRow = ({ item }: { item: CartItem }) => {
        const isSale = item.status === 'ONSALE';
        const isChecked = selectedIds.has(item.cartId);

        return (
            <div className={`relative flex flex-col md:flex-row items-center p-6 border-b border-gray-100 bg-white last:border-b-0 ${!isSale ? 'bg-gray-50 opacity-70' : ''}`}>
                
                {/* 1. 좌측 그룹: 체크박스 + 이미지 + 상품정보 */}
                <div className="flex items-center w-full md:w-auto md:flex-1 mb-4 md:mb-0">
                    {/* 체크박스 */}
                    <button 
                        onClick={() => handleToggleItem(item.cartId, item.status)}
                        disabled={!isSale}
                        className="mr-6 focus:outline-none shrink-0"
                    >
                        {isSale ? (
                            isChecked 
                                ? <IoCheckbox className="text-blue-500 text-2xl" /> 
                                : <IoSquareOutline className="text-gray-300 text-2xl" />
                        ) : (
                            <IoSquareOutline className="text-gray-200 text-2xl cursor-not-allowed" />
                        )}
                    </button>

                    {/* 이미지 */}
                    <img 
                        src={item.thumbnailImageUrl || 'https://via.placeholder.com/100'} 
                        alt={item.productName} 
                        className="w-24 h-24 object-cover rounded-lg border border-gray-100 mr-6 shadow-sm shrink-0"
                    />

                    {/* 상품명 및 단가 */}
                    <div className="flex flex-col">
                        <div className="text-base text-gray-800 font-medium mb-1 break-keep">
                            {item.productName}
                            {!isSale && <span className="text-red-500 font-bold text-xs ml-2">(판매중지)</span>}
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                            {formatPrice(item.price)} 원
                        </div>
                    </div>
                </div>

                {/* 2. 우측 그룹: 수량 조절 + 합계 금액 */}
                {isSale && (
                    <div className="flex items-center justify-between w-full md:w-auto md:justify-end gap-6 pl-0 md:pl-4">
                        
                        {/* 수량 조절 박스 (목표 이미지 스타일) */}
                        <div className="flex items-center border border-gray-300 rounded-md bg-white h-10">
                            <button 
                                onClick={() => handleQuantityChange(item.cartId, item.amount, -1)} 
                                className="px-3 h-full text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-l-md transition-colors text-lg"
                            >
                                −
                            </button>
                            <span className="w-10 text-center text-base font-semibold text-gray-900">{item.amount}</span>
                            <button 
                                onClick={() => handleQuantityChange(item.cartId, item.amount, 1)} 
                                className="px-3 h-full text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-r-md transition-colors text-lg"
                            >
                                +
                            </button>
                        </div>

                        {/* 아이템별 합계 금액 */}
                        <span className="text-lg font-bold text-gray-800 min-w-[120px] text-right">
                            {formatPrice(item.totalPrice)} 원
                        </span>
                    </div>
                )}

                {/* 3. 삭제 버튼 (우상단 고정) */}
                <button 
                    onClick={() => removeItem(item.cartId)}
                    className="absolute top-4 right-4 text-gray-300 hover:text-red-500 p-1 transition-colors"
                >
                    <IoClose size={22} />
                </button>
            </div>
        );
    };

    // --- 렌더링: 결제 수단 ---
    const PaymentOption = ({ method, label, color }: { method: PaymentMethod, label: string, color: string }) => (
        <div 
            onClick={() => setPaymentMethod(method)}
            className={`
                flex items-center p-3 border rounded-lg cursor-pointer transition-all
                ${paymentMethod === method ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:bg-gray-50'}
            `}
        >
            {paymentMethod === method 
                ? <IoRadioButtonOn className="text-blue-600 text-xl mr-2" /> 
                : <IoRadioButtonOff className="text-gray-300 text-xl mr-2" />
            }
            <div className="w-6 h-6 rounded-full flex items-center justify-center mr-2 text-white text-[10px] font-bold shadow-sm" style={{ backgroundColor: color }}>
                {label[0]}
            </div>
            <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
    );

    if (isLoading && items.length === 0) {
        return <div className="p-20 text-center text-gray-500">장바구니 정보를 불러오는 중입니다...</div>;
    }

    return (
        <div className="w-full max-w-4xl mx-auto py-10 px-4 pb-32">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">장바구니</h1>

            {/* 선택 바 */}
            <div className="flex justify-between items-center bg-white p-4 mb-4 border border-gray-200 rounded-lg shadow-sm">
                <button onClick={handleSelectAll} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium">
                    {items.length > 0 && selectedIds.size === items.filter(i => i.status === 'ONSALE').length 
                        ? <IoCheckbox className="text-blue-500 text-xl" /> 
                        : <IoSquareOutline className="text-gray-400 text-xl" />
                    }
                    전체 선택 ({selectedIds.size}/{items.length})
                </button>
                <button onClick={handleDeleteSelected} className="text-sm px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-gray-600 transition-colors">
                    선택 삭제
                </button>
            </div>

            {/* 리스트 */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-8">
                {items.length === 0 ? (
                    <div className="py-20 text-center text-gray-400 flex flex-col items-center">
                        <div className="text-lg mb-2">장바구니가 비어있습니다.</div>
                        <p className="text-sm text-gray-400">원하는 상품을 담아보세요.</p>
                    </div>
                ) : (
                    items.map(item => <CartItemRow key={item.cartId} item={item} />)
                )}
            </div>

            {/* 결제 수단 및 금액 요약 박스 (Grid Layout) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* 왼쪽: 결제 수단 */}
                <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm h-full">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">결제 수단</h2>
                    <div className="grid grid-cols-1 gap-3">
                        <PaymentOption method="TOSS" label="토스페이" color="#0050FF" />
                        <PaymentOption method="KAKAO" label="카카오페이" color="#FEE500" />
                        <PaymentOption method="CARD" label="신용카드" color="#333" />
                        <PaymentOption method="MOBILE" label="휴대폰결제" color="#2DB400" />
                    </div>
                </div>

                {/* 오른쪽: 최종 금액 */}
                <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm h-full flex flex-col justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">결제 금액</h2>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600">총 상품금액</span>
                            <span className="font-medium">{formatPrice(finalPrice)}원</span>
                        </div>
                        <div className="flex justify-between items-center mb-2 text-gray-600">
                            <span>배송비</span>
                            <span>0원</span>
                        </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                        <span className="text-lg font-bold text-gray-800">최종 결제금액</span>
                        <span className="text-3xl font-bold text-blue-600">{formatPrice(finalPrice)}원</span>
                    </div>
                </div>
            </div>

            {/* 하단 고정 구매 버튼 */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-50">
                <div className="max-w-4xl mx-auto">
                    <button
                        className={`w-full py-4 rounded-xl text-xl font-bold text-white transition-all transform active:scale-[0.99]
                            ${selectedIds.size > 0 
                                ? 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200' 
                                : 'bg-gray-300 cursor-not-allowed'}
                        `}
                        disabled={selectedIds.size === 0}
                        onClick={() => alert(`${formatPrice(finalPrice)}원 결제하기 (${paymentMethod})`)}
                    >
                        총 {selectedIds.size}개 상품 구매하기
                    </button>
                </div>
            </div>
        </div>
    );
}
