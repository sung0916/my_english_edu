import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "@/api";
import { useCartStore } from "@/store/useCartStore";
import { useUserStore } from "@/store/userStore";
import PermitCustomButton from "@/components/common/PosButtonProps";

interface ImageDetail {
    imageId: number;
    imageUrl: string;
}

interface ProductDetail {
    id: number;
    productName: string;
    price: number;
    description: string;
    images: ImageDetail[];
    amount: number;
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

    useEffect(() => {
        if (id) {
            const fetchProductsDetail = async () => {
                try {
                    const response = await apiClient.get<ProductDetail>(`/api/products/${id}`);
                    setProduct(response.data);
                    if (response.data.images && response.data.images.length > 0) {
                        setSelectedImage(response.data.images[0].imageUrl);
                    }
                } catch (error) {
                    console.error('상품 정보를 불러오는 데 실패', error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchProductsDetail();
        }
    }, [id]);

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
            await addToCart(product.id, quantity);
            if (window.confirm("장바구니에 담았습니다. 장바구니로 이동하시겠습니까?")) {
                navigate('/user/cart');
            }
        } catch (error) {
            console.error(error);
            alert("장바구니 담기에 실패했습니다.");
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
            await addToCart(product.id, quantity);
            navigate('/user/cart');
        } catch (err) {
            console.error(err);
            alert('Error in processing now.\nTry again.');
        } finally {
            setIsAddingCart(false);
        }
    };

    if (isLoading) return <div className="p-10 text-center">Loading...</div>;
    if (!product) return <div className="p-10 text-center">상품을 찾을 수 없습니다.</div>;

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 bg-white min-h-screen">
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
                    
                    <div className="text-3xl font-bold text-red-600 mb-6">
                        {product.price.toLocaleString()}원
                    </div>

                    <div className="border-t border-gray-200 my-4" />

                    <div className="flex items-center justify-between mb-6">
                        <span className="font-bold text-gray-700">수량</span>
                        <div className="flex items-center border border-gray-300 rounded">
                            <button 
                                onClick={() => handleQuantityChange(-1)} 
                                className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 border-r border-gray-300"
                            >
                                -
                            </button>
                            <span className="w-12 text-center font-medium">{quantity}</span>
                            <button 
                                onClick={() => handleQuantityChange(1)} 
                                className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 border-l border-gray-300"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg mb-6">
                        <span className="font-bold text-gray-700">총 상품금액</span>
                        <span className="text-xl font-bold text-red-600">
                            {(product.price * quantity).toLocaleString()}원
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
