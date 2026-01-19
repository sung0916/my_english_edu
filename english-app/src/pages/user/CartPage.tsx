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
import apiClient from "@/api";

// 숫자 포맷 함수
const formatPrice = (price: number) => price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export default function CartPage() {
    const navigate = useNavigate();
    const { isLoggedIn } = useUserStore();
    const { items, fetchCart, updateItemAmount, removeItem } = useCartStore();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    // 1. 초기 데이터 로드
    useEffect(() => {
        if (!isLoggedIn) {
            alert('Please login first');
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
        if (selectedIds.size === 0) return alert("Select products you want to delete");
        if (!window.confirm(`Do you want to delete ${selectedIds.size} items?`)) return;

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

    // 주문 생성 및 결제 페이지 이동💫
    const handleOrderCreate = async () => {
        if (selectedIds.size === 0) {
            alert("Select products to pay");
            return;
        }

        try {
            // a. 백엔드에 주문 생성 요청 (DTO: {cartIds: [1,2,3]})
            const response = await apiClient.post('/api/orders', {
                cartIds: Array.from(selectedIds)
            });

            // b. 생성된 orderId 받기
            const {orderId} = response.data;

            // c. 결제 페이지 이동
            navigate(`/user/checkout?orderId=${orderId}`);

        } catch (err) {
            console.error('주문 생성 실패 : ', err);
            alert("Failed loading products")
        }
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
                        src={item.thumbnailImageUrl || 'https://placeholder.com/100'} 
                        alt={item.productName} 
                        className="w-24 h-24 object-cover rounded-lg border border-gray-100 mr-6 shadow-sm shrink-0"
                    />

                    {/* 상품명 및 단가 */}
                    <div className="flex flex-col">
                        <div className="text-base text-gray-800 font-medium mb-1 break-keep">
                            {item.productName}
                            {!isSale && <span className="text-red-500 font-bold text-xs ml-2">(Sold out)</span>}
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                            {formatPrice(item.price)} ₩
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
                            {formatPrice(item.totalPrice)} ₩
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

    if (isLoading && items.length === 0) {
        return <div className="p-20 text-center text-gray-500">장바구니 정보를 불러오는 중입니다...</div>;
    }

    return (
        <div className="w-full max-w-4xl mx-auto py-10 px-4 pb-32">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">My cart</h1>

            {/* 선택 바 */}
            <div className="flex justify-between items-center bg-white p-4 mb-4 border border-gray-200 rounded-lg shadow-sm">
                <button onClick={handleSelectAll} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium">
                    {items.length > 0 && selectedIds.size === items.filter(i => i.status === 'ONSALE').length 
                        ? <IoCheckbox className="text-blue-500 text-xl" /> 
                        : <IoSquareOutline className="text-gray-400 text-xl" />
                    }
                    Select all ({selectedIds.size}/{items.length})
                </button>
                <button onClick={handleDeleteSelected} className="text-sm px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-gray-600 transition-colors">
                    Delete
                </button>
            </div>

            {/* 리스트 */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-8">
                {items.length === 0 ? (
                    <div className="py-20 text-center text-gray-400 flex flex-col items-center">
                        <div className="text-lg mb-2">Your cart is empty</div>
                        <p className="text-sm text-gray-400">Add products that you want</p>
                    </div>
                ) : (
                    items.map(item => <CartItemRow key={item.cartId} item={item} />)
                )}
            </div>

            {/* 💰 금액 요약 박스 (기존 결제수단 UI 제거 후 디자인 단순화) */}
            <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm mb-8">
                <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Payment info</h2>
                <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Price</span>
                    <span className="font-medium">{formatPrice(finalPrice)} ₩</span>
                </div>
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                    <span className="text-lg font-bold text-gray-800">Total price</span>
                    <span className="text-3xl font-bold text-blue-600">{formatPrice(finalPrice)} ₩</span>
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
                        onClick={handleOrderCreate} 
                    >
                        Buy {selectedIds.size} items
                    </button>
                </div>
            </div>
        </div>
    );
}
