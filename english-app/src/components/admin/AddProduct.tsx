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
                crossPlatformAlert('성공', `${data.length}개의 상품이 등록되었습니다.`);
            } 
            // 2. 객체인 경우 (단일 상품 등록)
            else {
                await createProductApi(data);
                crossPlatformAlert('성공', '상품이 성공적으로 등록되었습니다.');
            }
            
            navigate(-1); // 뒤로가기
        } catch (error) {
            console.error('상품 등록 실패:', error);
            crossPlatformAlert('오류', '상품 등록 중 오류가 발생했습니다.');
        }
    };

    // [추가] API 호출 로직 분리
    const createProductApi = async (item: ProductFormData) => {
        const payload = {
            productName: item.productName,
            price: item.price,
            amount: item.amount,
            type: item.type,
            licensePeriod: item.licensePeriod, // [중요] 기간 정보 추가
            description: item.description,
            imageIds: item.galleryImages.map(img => img.imageId),
        };
        await apiClient.post('/api/products/create', payload);
    };

    return (
        <div style={{ minHeight: 'calc(100vh - 80px)', padding: '20px', backgroundColor: '#f8f9fa' }}>
            <h2 className="text-2xl font-bold mb-4">상품 등록</h2>
            <ProductForm 
                onSubmit={handleCreate} 
                submitButtonText="상품 등록" 
            />
        </div>
    );
};

export default AddProduct;
