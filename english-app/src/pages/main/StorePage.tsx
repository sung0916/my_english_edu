import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "@/api";
import { Pagination } from "@/components/common/Pagination";
import { crossPlatformAlert } from "@/utils/crossPlatformAlert";

const ITEMS_PER_PAGE = 12;

interface Item {
    id: number;
    productName: string;
    price: number;
    imageUrl: string | null;
}

interface Page<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
}

const StorePage = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [items, setItems] = useState<Item[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const fetchItems = useCallback(async (page: number) => {
        setIsLoading(true);
        try {
            const response = await apiClient.get<Page<Item>>('/api/products/list', {
                params: {
                    page: page - 1,
                    size: ITEMS_PER_PAGE,
                    sort: 'id,desc',
                },
            });
            setItems(response.data.content);
            setTotalItems(response.data.totalElements);
        } catch (error) {
            crossPlatformAlert('오류', '상품 목록 로드 실패');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchItems(currentPage); }, [currentPage, fetchItems]);

    return (
        <div className="p-5 min-h-screen bg-white">
            {isLoading ? (
                <div className="text-center mt-20">Loading...</div>
            ) : items.length === 0 ? (
                <div className="text-center mt-20 text-gray-500">등록된 상품이 없습니다.</div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                    {items.map((item) => (
                        <div 
                            key={item.id}
                            onClick={() => navigate(`/main/store/${item.id}`)}
                            className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md cursor-pointer transition-shadow"
                        >
                            <div className="aspect-square bg-gray-100 relative">
                                {item.imageUrl ? (
                                    <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">NO IMAGE</div>
                                )}
                            </div>
                            <div className="p-3">
                                <h3 className="font-medium text-gray-800 text-sm mb-1 truncate">{item.productName}</h3>
                                <p className="font-bold text-gray-900">{item.price.toLocaleString()}원</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {totalItems > 0 && (
                <div className="flex justify-center border-t border-gray-100 pt-4">
                    <Pagination
                        currentPage={currentPage}
                        totalItems={totalItems}
                        itemsPerPage={ITEMS_PER_PAGE}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )}
        </div>
    );
};

export default StorePage;
