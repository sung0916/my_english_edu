import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProductForm, { ProductFormData, UploadedImage } from '@/components/admin/ProductForm';
import apiClient from '@/api';
import { crossPlatformAlert } from "@/utils/crossPlatformAlert";
import { ProductType, LicensePeriod } from '@/types/product';

// 백엔드 응답 타입
interface ProductDetailResponse {
    id: number;
    productName: string;
    price: number;
    amount: number;
    description: string;
    type: ProductType;
    licensePeriod?: LicensePeriod; // 백엔드에서 받아올 기간 정보
    images: { imageId: number; imageUrl: string }[]; // imageId로 이름 통일 확인 필요 (백엔드 DTO 확인)
}

const EditProduct = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [initialData, setInitialData] = useState<ProductFormData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // 데이터 불러오기
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await apiClient.get<ProductDetailResponse>(`/api/products/${id}`);
                const data = response.data;

                // 이미지 매핑
                const mappedImages: UploadedImage[] = data.images.map(img => ({
                    imageId: img.imageId, // 백엔드 DTO 필드명 확인 (id vs imageId)
                    imageUrl: img.imageUrl,
                    url: img.imageUrl
                }));

                setInitialData({
                    id: data.id,
                    productName: data.productName,
                    price: data.price,
                    amount: data.amount,
                    type: data.type,
                    licensePeriod: data.licensePeriod, // [추가] 초기값 세팅
                    description: data.description,
                    galleryImages: mappedImages
                });
            } catch (error) {
                console.error("로딩 실패:", error);
                crossPlatformAlert("Failed to load product data", "");
                navigate(-1);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchProduct();
    }, [id, navigate]);

    // 수정 요청 핸들러
    const handleEdit = async (data: ProductFormData | ProductFormData[]) => {
        // [중요] 수정 모드에서는 '현재 수정 중인 ID'에 대한 데이터만 처리합니다.
        // ProductForm이 배열을 반환하더라도, 우리는 단일 수정 API를 호출합니다.
        
        let targetItem: ProductFormData;

        if (Array.isArray(data)) {
            // 배열인 경우: 현재 수정하려는 상품의 licensePeriod와 일치하는 것을 찾거나 첫 번째 것을 사용
            // (ProductForm 로직상 체크된 것만 넘어오므로, 
            // 사용자가 수정을 위해 체크를 해제했다가 다시 하면 배열에 1개만 있을 수도 있음)
            const found = data.find(d => d.licensePeriod === initialData?.licensePeriod);
            targetItem = found || data[0]; 
        } else {
            targetItem = data;
        }

        const payload = {
            id: Number(id),
            productName: targetItem.productName,
            price: targetItem.price,
            amount: targetItem.amount,
            type: targetItem.type,
            licensePeriod: targetItem.type === 'ITEM' ? null : targetItem.licensePeriod, // [추가]
            description: targetItem.description,
            imageIds: targetItem.galleryImages.map(img => img.imageId),
        };

        try {
            await apiClient.patch('/api/products/edit', payload);
            crossPlatformAlert('Success to edit', '');
            navigate(-1);
        } catch (error) {
            console.error('수정 실패:', error);
            crossPlatformAlert('Failed to edit product', '');
        }
    };

    if (isLoading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div style={{ minHeight: 'calc(100vh - 80px)', padding: '20px', backgroundColor: '#f8f9fa' }}>
            <h2 className="text-2xl font-bold mb-4">Edit product</h2>
            {initialData && (
                <ProductForm 
                    initialData={initialData} 
                    onSubmit={handleEdit} 
                    submitButtonText="Edit" 
                />
            )}
        </div>
    );
};

export default EditProduct;
