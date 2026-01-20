import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoAddCircleOutline } from "react-icons/io5";
import apiClient from "@/api";
import { Pagination } from "@/components/common/Pagination";
import { SearchBox, SearchOption } from "@/components/common/SearchBox";
import { crossPlatformAlert } from "@/utils/crossPlatformAlert";
import { useSearch } from "@/hooks/useSearch";

const ITEMS_PER_PAGE = 10;
type ProductStatus = 'ONSALE' | 'NOTONSALE';

interface Product {
    id: number;
    productName: string;
    salesVolume: number;
    status: ProductStatus;
}

interface Page<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
}

const ProductListPage = () => {
    const navigate = useNavigate();
    const productSearchOptions: SearchOption[] = [
        { value: 'productName', label: 'name' },
    ];

    const [isLoading, setIsLoading] = useState(true);
    const [products, setProducts] = useState<Product[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const { onSearch, getSearchParams } = useSearch('name');

    const fetchProducts = useCallback(async (page: number) => {
        setIsLoading(true);
        try {
            const params: any = {
                page: page - 1,
                size: ITEMS_PER_PAGE,
                sort: 'id,desc',
                ...getSearchParams() 
            };
            const response = await apiClient.get<Page<Product>>('/api/products/list', { params });
            setProducts(response.data.content);
            setTotalItems(response.data.totalElements);

        } catch (error) {
            console.error(error);
            crossPlatformAlert('오류', '목록 로드 실패');
        } finally {
            setIsLoading(false);
        }
    }, [getSearchParams]);

    useEffect(() => {
        fetchProducts(currentPage);
    }, [currentPage, fetchProducts]);

    const handleStatusChange = async (productId: number, newStatus: ProductStatus) => {
        const original = [...products];
        setProducts(prev => prev.map(p => p.id === productId ? { ...p, status: newStatus } : p));

        try {
            await apiClient.patch('/api/products/edit', { id: productId, status: newStatus });
        } catch (error) {
            setProducts(original);
            crossPlatformAlert('오류', '상태 변경 실패');
        }
    };

    return (
        <div className="bg-white min-w-[720px] p-6 rounded-lg shadow-sm h-full flex flex-col">
            <div className="mb-4">
                <SearchBox options={productSearchOptions} onSearch={onSearch} />
            </div>

            <div className="flex flex-row bg-gray-50 border-b-2 border-gray-200 py-3 px-2 font-bold text-gray-700 text-center">
                <div className="flex-1">No</div>
                <div className="flex-[3.5]">Name</div>
                <div className="flex-[1.5]">Sales</div>
                <div className="flex-[1.5]">Status</div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {products.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">No product in store</div>
                ) : (
                    products.map((item) => (
                        <div 
                            key={item.id} 
                            className="flex flex-row items-center border-b border-gray-100 py-3 px-2 hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => navigate(`/main/store/${item.id}`)}
                        >
                            <div className="flex-1 text-center">{item.id}</div>
                            <div className="flex-[3.5] px-4 font-medium text-gray-800 text-left truncate">{item.productName}</div>
                            <div className="flex-[1.5] text-center text-gray-600">{item.salesVolume}</div>
                            <div className="flex-[1.5] text-center" onClick={e => e.stopPropagation()}>
                                <select
                                    value={item.status}
                                    onChange={(e) => handleStatusChange(item.id, e.target.value as ProductStatus)}
                                    className={`
                                        border rounded px-2 py-1 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500
                                        ${item.status === 'ONSALE' ? 'text-blue-600 border-blue-200 bg-blue-50' : 'text-gray-500 border-gray-200 bg-gray-50'}
                                    `}
                                >
                                    <option value="ONSALE">On sale</option>
                                    <option value="NOTONSALE">Paused</option>
                                </select>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="mt-4 flex flex-col items-end gap-2">
                <button 
                    onClick={() => navigate('/admin/addProduct')}
                    className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                >
                    <IoAddCircleOutline size={18} />
                    <span>Add</span>
                </button>
                
                <div className="w-full flex justify-center">
                    <Pagination
                        currentPage={currentPage}
                        totalItems={totalItems}
                        itemsPerPage={ITEMS_PER_PAGE}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>
        </div>
    );
};

export default ProductListPage;
