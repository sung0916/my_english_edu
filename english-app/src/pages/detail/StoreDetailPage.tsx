import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "@/api";
import { useCartStore } from "@/store/useCartStore";
import { useUserStore } from "@/store/userStore";
import PermitCustomButton from "@/components/common/PosButtonProps";
import { ProductType, LicensePeriod, PERIOD_LABELS } from '@/types/product'; 

interface ImageDetail {
    imageId: number;
    imageUrl: string;
}

interface ProductOption {
    productId: number;
    licensePeriod: LicensePeriod;
    price: number;
}

interface ProductDetail {
    id: number;
    productName: string;
    price: number;
    description: string;
    images: ImageDetail[];
    amount: number;
    type: ProductType;
    licensePeriod?: LicensePeriod;
    options?: ProductOption[];
}

export default function StoreDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { user, isLoggedIn } = useUserStore();
    const { addToCart } = useCartStore();

    const [product, setProduct] = useState<ProductDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [isAddingCart, setIsAddingCart] = useState(false);
    
    // 초기값을 id로 설정하되, 로딩 전이라 0이어도 무방함 (useEffect에서 곧바로 업데이트됨)
    const [currentId, setCurrentId] = useState<number>(0);
    const [currentPrice, setCurrentPrice] = useState<number>(0);

    // [체크] product가 null일 때 안전하게 접근하기 위해 옵셔널 체이닝 사용
    const isSubscription = product?.type === 'SUBSCRIPTION';

    useEffect(() => {
        if (id) fetchProduct(id);
    }, [id]);

    const fetchProduct = async (targetId: string | number) => {
        try {
            setIsLoading(true);
            const response = await apiClient.get<ProductDetail>(`/api/products/${targetId}`);
            setProduct(response.data);
            setCurrentId(response.data.id);
            setCurrentPrice(response.data.price);

            // 수량 초기화 (상품이 바뀌면 수량도 1로 리셋하는 것이 자연스러움)
            setQuantity(1); 
            
            if (response.data.images && response.data.images.length > 0) {
                setSelectedImage(response.data.images[0].imageUrl);
            }
        } catch (error) {
            console.error('상품 정보를 불러오는 데 실패', error);
        } finally {
            setIsLoading(false);
        }
    };

    // [수정 1] 중복 요청 제거: navigate만 하면 useEffect가 알아서 fetchProduct를 호출함
    const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = Number(e.target.value);
        setCurrentId(selectedId);

        // options 배열에서 선택된 ID에 해당하는 가격을 찾아서 업데이트
        if (product?.options) {
            const selectedOption = product.options.find(opt => opt.productId === selectedId);
            if (selectedOption) {
                setCurrentPrice(selectedOption.price);
            }
        }
    };

    const handleQuantityChange = (change: number) => {
        const newQuantity = quantity + change;
        if (newQuantity >= 1 && newQuantity <= (product?.amount || 999)) {
            setQuantity(newQuantity);
        }
    };

    const handleAddToCart = async () => {
        if (!isLoggedIn) {
            alert('Please Log in first');
            navigate('/auth/login');
            return;
        }
        if (!product) return;

        try {
            setIsAddingCart(true);
            await addToCart(currentId, quantity);
            if (window.confirm("Success to add.\nDo you want to move to My Cart?")) {
                navigate('/user/cart');
            }
        } catch (error) {
            console.error(error);
            alert("Failed to add");
        } finally {
            setIsAddingCart(false);
        }
    };

    const handleBuyNow = async () => {
        if (!isLoggedIn) {
            alert("Please login first");
            navigate('/auth/login');
            return;
        }
        if (!product) return;

        try {
            setIsAddingCart(true);
            // [수정 2] product.id 대신 현재 선택된 currentId 사용 (일관성 유지)
            await addToCart(currentId, quantity);
            navigate('/user/cart');
        } catch (err) {
            console.error(err);
            alert('Error in processing now.\nTry again.');
        } finally {
            setIsAddingCart(false);
        }
    };

    if (isLoading) return <div className="p-10 text-center">Loading...</div>;
    if (!product) return <div className="p-10 text-center">Product is not ready</div>;

    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-8 bg-white min-h-screen">
            <div className="flex flex-col md:flex-row gap-8 mb-12">

                {/* 1. 왼쪽: 이미지 갤러리 */}
                <div className="w-full md:w-1/2 flex flex-col gap-4">
                    <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center">
                        {selectedImage ? (
                            <img src={selectedImage} alt={product.productName} className="w-full h-full object-contain" />
                        ) : (
                            <span className="text-gray-400">No Image</span>
                        )}
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {product.images.map((img, index) => (
                            <div
                                key={img.imageId || index}
                                onClick={() => setSelectedImage(img.imageUrl)}
                                className={`
                                    w-16 h-16 rounded border cursor-pointer overflow-hidden flex-shrink-0
                                    ${selectedImage === img.imageUrl ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'}
                                `}
                            >
                                <img src={img.imageUrl} alt="thumb" className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. 오른쪽: 상품 정보 */}
                <div className="w-full md:w-1/2 flex flex-col">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{product.productName}</h1>

                    {/* 구독권 태그 표시 */}
                    {isSubscription && (
                        <div className="mb-4">
                            <span className="inline-block bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded font-medium mr-2">
                                구독권
                            </span>
                        </div>
                    )}

                    <div className="text-3xl font-bold text-red-600 mb-6">
                        {currentPrice.toLocaleString()}원
                    </div>

                    <div className="border-t border-gray-200 my-4" />

                    {/* 분기 처리: 구독권이면 기간 선택, 일반이면 수량 조절 */}
                    {isSubscription ? (
                        <div className="mb-6">
                            <label className="block text-sm font-bold text-gray-700 mb-2">이용 기간 선택</label>
                            {product.options && product.options.length > 0 ? (
                                <select
                                    className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={currentId}
                                    onChange={handlePeriodChange}
                                >
                                    {/* options에 자기 자신과 형제 상품들이 모두 들어있다고 가정 */}
                                    {product.options.map(opt => (
                                        <option key={opt.productId} value={opt.productId}>
                                            {PERIOD_LABELS[opt.licensePeriod]} ({opt.price.toLocaleString()}원)
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                // 옵션이 없을 때 (형제 상품이 없음)
                                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 font-medium">
                                    {product.licensePeriod ? PERIOD_LABELS[product.licensePeriod] : '기간 정보 없음'}
                                </div>
                            )}
                            <p className="text-xs text-gray-500 mt-2">* 선택하신 기간만큼 이용 권한이 부여됩니다.</p>
                        </div>
                    ) : (
                        // ITEM일 때: 수량 조절
                        <div className="flex items-center justify-between mb-6">
                            <span className="font-bold text-gray-700">수량</span>
                            <div className="flex items-center border border-gray-300 rounded">
                                <button
                                    onClick={() => handleQuantityChange(-1)}
                                    className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 border-r border-gray-300"
                                >-</button>
                                <span className="w-12 text-center font-medium">{quantity}</span>
                                <button
                                    onClick={() => handleQuantityChange(1)}
                                    className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 border-l border-gray-300"
                                >+</button>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg mb-6">
                        <span className="font-bold text-gray-700">총 상품금액</span>
                        <span className="text-xl font-bold text-red-600">
                            {(currentPrice * quantity).toLocaleString()}원
                        </span>
                    </div>

                    <div className="flex gap-3 h-12 mb-6">
                        <button
                            onClick={handleAddToCart}
                            disabled={isAddingCart}
                            className="flex-1 border border-blue-600 text-blue-600 font-bold rounded hover:bg-blue-50 transition-colors disabled:opacity-50"
                        >
                            {isAddingCart ? '담는 중...' : '장바구니 담기'}
                        </button>
                        <button
                            onClick={handleBuyNow}
                            disabled={isAddingCart}
                            className="flex-1 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {isAddingCart ? '처리 중...' : '바로구매'}
                        </button>
                    </div>

                    {user?.role === 'ADMIN' && (
                        <div className="flex justify-end mt-4">
                            <PermitCustomButton title="수정" onClick={() => navigate(`/admin/editProduct/${id}`)} />
                        </div>
                    )}
                </div>
            </div>

            {/* 3. 하단: 상세 설명 */}
            <div className="border-t border-gray-200 pt-10">
                <h2 className="text-xl font-bold mb-6 border-b border-gray-200 pb-2">상품 상세 정보</h2>
                <div
                    className="prose max-w-none text-gray-800 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                />
            </div>
        </div>
    );
}
