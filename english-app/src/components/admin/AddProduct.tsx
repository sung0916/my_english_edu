import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProductForm, { ProductFormData } from '@/components/admin/ProductForm';
import apiClient from '@/api';
import { crossPlatformAlert } from "@/utils/crossPlatformAlert";

const AddProduct = () => {
    const navigate = useNavigate();

    // [수정] data가 배열일 수도 있음
    const handleCreate = async (data: ProductFormData | ProductFormData[]) => {
        try {
            // 1. 배열인 경우 (구독권 일괄 등록)
            if (Array.isArray(data)) {
                for (const item of data) {
                    await createProductApi(item);
                }
                crossPlatformAlert('Suceess', `${data.length} products have been registered`);
            } 
            // 2. 객체인 경우 (단일 상품 등록)
            else {
                await createProductApi(data);
                crossPlatformAlert('Success to add product', '');
            }
            
            navigate(-1); // 뒤로가기
        } catch (error) {
            console.error('상품 등록 실패:', error);
            crossPlatformAlert('Failed', 'Please try again');
        }
    };

    // [추가] API 호출 로직 분리
    const createProductApi = async (item: ProductFormData) => {
        const payload = {
            productName: item.productName,
            price: item.price,
            amount: item.amount,
            type: item.type,
            licensePeriod: item.type === 'ITEM' ? null : item.licensePeriod, // [중요] 기간 정보 추가
            description: item.description,
            imageIds: item.galleryImages.map(img => img.imageId),
        };
        await apiClient.post('/api/products/create', payload);
    };

    return (
        <div style={{ minHeight: 'calc(100vh - 80px)', padding: '20px', backgroundColor: '#f8f9fa' }}>
            <h2 className="text-2xl font-bold mb-4">Add product</h2>
            <ProductForm 
                onSubmit={handleCreate} 
                submitButtonText="Proceed" 
            />
        </div>
    );
};

export default AddProduct;
