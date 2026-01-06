import apiClient from "@/api";
import ProductForm, { ProductFormData } from "@/components/admin/ProductForm";
import { crossPlatformAlert } from "@/utils/crossPlatformAlert";
import { useNavigate } from "react-router-dom";

const AddProduct = () => {
    const navigate = useNavigate();

    const handleCreate = async (data: ProductFormData) => {
        const payload = {
            productName: data.productName,
            price: data.price,
            amount: data.amount,
            type: data.type,
            description: data.description,
            imageIds: data.galleryImages.map(img => img.imageId),
        };

        try {
            await apiClient.post('/api/products/create', payload);
            crossPlatformAlert('성공', '상품이 성공적으로 등록되었습니다.');
            navigate(-1); // 뒤로가기
        } catch (error) {
            console.error('상품 등록 실패:', error);
            crossPlatformAlert('오류', '상품 등록 중 오류가 발생했습니다.');
        }
    };

    return (
        <div style={{ height: 'calc(100vh - 80px)', padding: '20px', backgroundColor: '#f8f9fa' }}>
            <ProductForm 
                onSubmit={handleCreate} 
                submitButtonText="상품 등록" 
            />
        </div>
    );
};

export default AddProduct;
