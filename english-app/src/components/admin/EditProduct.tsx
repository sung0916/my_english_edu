import apiClient from "@/api";
import ProductForm, { ProductFormData, UploadedImage } from "@/components/admin/ProductForm";
import { crossPlatformAlert } from "@/utils/crossPlatformAlert";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

// 백엔드 응답 타입
interface ProductDetailResponse {
    id: number;
    productName: string;
    price: number;
    amount: number;
    description: string;
    type: 'SUBSCRIPTION' | 'ITEM';
    images: { id: number; imageUrl: string }[];
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

                const mappedImages: UploadedImage[] = data.images.map(img => ({
                    imageId: img.id,
                    imageUrl: img.imageUrl,
                    url: img.imageUrl
                }));

                setInitialData({
                    id: data.id,
                    productName: data.productName,
                    price: data.price,
                    amount: data.amount,
                    type: data.type,
                    description: data.description,
                    galleryImages: mappedImages
                });
            } catch (error) {
                console.error("로딩 실패:", error);
                crossPlatformAlert("오류", "상품 정보를 불러오지 못했습니다.");
                navigate(-1);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchProduct();
    }, [id, navigate]);

    // 수정 요청
    const handleEdit = async (data: ProductFormData) => {
        const payload = {
            id: Number(id),
            productName: data.productName,
            price: data.price,
            amount: data.amount,
            type: data.type,
            description: data.description,
            imageIds: data.galleryImages.map(img => img.imageId),
        };

        try {
            await apiClient.post('/api/products/edit', payload);
            crossPlatformAlert('성공', '상품 정보가 수정되었습니다.');
            navigate(-1);
        } catch (error) {
            console.error('수정 실패:', error);
            crossPlatformAlert('오류', '상품 수정 중 오류가 발생했습니다.');
        }
    };

    if (isLoading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div style={{ height: 'calc(100vh - 80px)', padding: '20px', backgroundColor: '#f8f9fa' }}>
            {initialData && (
                <ProductForm 
                    initialData={initialData} 
                    onSubmit={handleEdit} 
                    submitButtonText="수정 완료" 
                />
            )}
        </div>
    );
};

export default EditProduct;
