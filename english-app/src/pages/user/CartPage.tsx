import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "@/store/useCartStore";
import { useUserStore } from "@/store/userStore";
import { CartItem } from "@/types/cart";
import { 
    IoCheckbox, 
    IoSquareOutline, 
    IoAdd, 
    IoRemove, 
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

    // --- 렌더링: 개별 아이템 ---
    const CartItemRow = ({ item }: { item: CartItem }) => {
        const isSale = item.status === 'ONSALE';
        const isChecked = selectedIds.has(item.cartId);

        return (
            <div className={`flex flex-col md:flex-row p-4 border-b border-gray-100 bg-white mb-2 last:mb-0 ${!isSale ? 'bg-gray-50 opacity-70' : ''}`}>
                {/* 체크박스 & 상품정보 */}
                <div className="flex flex-1 items-start">
                    <button 
                        onClick={() => handleToggleItem(item.cartId, item.status)}
                        disabled={!isSale}
                        className="mr-3 mt-1 text-2xl focus:outline-none"
                    >
                        {isSale ? (
                            isChecked ? <IoCheckbox className="text-blue-500" /> : <IoSquareOutline className="text-gray-300" />
                        ) : (
                            <IoSquareOutline className="text-gray-200 cursor-not-allowed" />
                        )}
                    </button>

                    <img 
                        src={item.thumbnailImageUrl || 'https://via.placeholder.com/80'} 
                        alt={item.productName} 
                        className="w-20 h-20 object-cover rounded-md border border-gray-100 mr-4"
                    />

                    <div className="flex-1 pr-8">
                        <div className="text-sm text-gray-800 font-medium mb-1 break-keep">
                            {item.productName}
                            {!isSale && <span className="text-red-500 font-bold text-xs ml-1">(판매중지)</span>}
                        </div>
                        <div className="text-base font-bold text-gray-900 mb-2">
                            {formatPrice(item.price)}원
                        </div>

                        {/* 모바일 레이아웃 대응: 수량 조절기 */}
                        {isSale && (
                            <div className="flex items-center justify-between bg-gray-50 rounded-md p-1 w-full max-w-[200px] border border-gray-200">
                                <div className="flex items-center border border-gray-300 rounded bg-white">
                                    <button onClick={() => handleQuantityChange(item.cartId, item.amount, -1)} className="px-2 py-1 hover:bg-gray-100">
                                        <IoRemove size={14} />
                                    </button>
                                    <span className="w-8 text-center text-sm font-semibold">{item.amount}</span>
                                    <button onClick={() => handleQuantityChange(item.cartId, item.amount, 1)} className="px-2 py-1 hover:bg-gray-100">
                                        <IoAdd size={14} />
                                    </button>
                                </div>
                                <span className="text-sm font-bold text-gray-700 mr-2">
                                    {formatPrice(item.totalPrice)}원
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 삭제 버튼 (절대 위치로 우상단 고정) */}
                <button 
                    onClick={() => removeItem(item.cartId)}
                    className="absolute md:static top-4 right-4 text-gray-400 hover:text-red-500 p-1"
                >
                    <IoClose size={20} />
                </button>
            </div>
        );
    };

    // --- 렌더링: 결제 수단 ---
    const PaymentOption = ({ method, label, color }: { method: PaymentMethod, label: string, color: string }) => (
        <div 
            onClick={() => setPaymentMethod(method)}
            className={`
                flex items-center p-3 border rounded-lg cursor-pointer transition-colors
                ${paymentMethod === method ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}
            `}
        >
            {paymentMethod === method 
                ? <IoRadioButtonOn className="text-blue-600 text-xl mr-2" /> 
                : <IoRadioButtonOff className="text-gray-300 text-xl mr-2" />
            }
            <div className="w-6 h-6 rounded-full flex items-center justify-center mr-2 text-white text-[10px] font-bold" style={{ backgroundColor: color }}>
                {label[0]}
            </div>
            <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
    );

    if (isLoading && items.length === 0) {
        return <div className="p-10 text-center text-gray-500">Loading cart...</div>;
    }

    return (
        <div className="w-full max-w-3xl mx-auto pb-24"> {/* pb-24: 하단 고정 버튼 공간 확보 */}
            <h1 className="text-2xl font-bold text-gray-800 mb-6">장바구니 ({items.length})</h1>

            {/* 선택 바 */}
            <div className="flex justify-between items-center bg-white p-4 mb-4 border border-gray-200 rounded-lg shadow-sm">
                <button onClick={handleSelectAll} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                    {items.length > 0 && selectedIds.size === items.filter(i => i.status === 'ONSALE').length 
                        ? <IoCheckbox className="text-blue-500 text-xl" /> 
                        : <IoSquareOutline className="text-xl" />
                    }
                    전체 선택 ({selectedIds.size}/{items.length})
                </button>
                <button onClick={handleDeleteSelected} className="text-xs px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-100 text-gray-600">
                    선택 삭제
                </button>
            </div>

            {/* 리스트 */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-6">
                {items.length === 0 ? (
                    <div className="p-10 text-center text-gray-400">장바구니가 비어있습니다.</div>
                ) : (
                    items.map(item => <CartItemRow key={item.cartId} item={item} />)
                )}
            </div>

            {/* 결제 수단 */}
            {selectedIds.size > 0 && (
                <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm mb-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">결제수단</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <PaymentOption method="TOSS" label="토스페이" color="#0050FF" />
                        <PaymentOption method="KAKAO" label="카카오페이" color="#FEE500" />
                        <PaymentOption method="CARD" label="신용카드" color="#333" />
                        <PaymentOption method="MOBILE" label="휴대폰결제" color="#2DB400" />
                    </div>
                </div>
            )}

            {/* 결제 금액 요약 */}
            <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm mb-6">
                <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">총 결제금액</span>
                    <span className="text-2xl font-bold text-gray-900">{formatPrice(finalPrice)}원</span>
                </div>
            </div>

            {/* 하단 고정 버튼 */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50">
                <div className="max-w-3xl mx-auto">
                    <button
                        className={`w-full py-4 rounded-lg text-lg font-bold text-white transition-colors
                            ${selectedIds.size > 0 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'}
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
