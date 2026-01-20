import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "@/api";
import { Pagination } from "@/components/common/Pagination";
import { SearchBox, SearchOption } from "@/components/common/SearchBox";
import { crossPlatformAlert } from "@/utils/crossPlatformAlert";
import { useSearch } from "@/hooks/useSearch";

const ITEMS_PER_PAGE = 10;

interface Post {
    announcementId: number;
    title: string;
    authorName: string;
    viewCount: number;
    createdAt: string;
}

interface Page<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
}

const BoardPage = () => {
    const navigate = useNavigate();
    const boardSearchOptions: SearchOption[] = [
        { value: 'title', label: 'Title' },
        { value: 'content', label: 'Content' },
    ];

    const [isLoading, setIsLoading] = useState(true);
    const [posts, setPosts] = useState<Post[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const { onSearch, getSearchParams, searchState } = useSearch('title');

    const fetchPosts = useCallback(async (page: number) => {
        setIsLoading(true);

        try {
            const params: any = {
                page: page - 1,
                size: ITEMS_PER_PAGE,
                sort: 'id,desc',
                ...getSearchParams()
            };

            const response = await apiClient.get<Page<Post>>('/api/announcements/list', { params });
            
            setPosts(response.data.content);
            setTotalItems(response.data.totalElements);

        } catch (error) {
            console.error(error);
            crossPlatformAlert("오류", "게시글 목록 로드 실패");
        } finally {
            setIsLoading(false);
        }
    }, [getSearchParams]);

    useEffect(() => {
        fetchPosts(currentPage);
    }, [currentPage, fetchPosts]);

    return (
        <div className="p-5 bg-white min-h-screen">
            <SearchBox options={boardSearchOptions} onSearch={onSearch} />

            {/* 테이블 헤더 */}
            <div className="flex bg-gray-50 border-b-2 border-gray-200 py-3 px-4 mt-4 font-bold text-gray-700 text-center">
                <div className="w-16">No</div>
                <div className="flex-1 text-left px-4">Title</div>
                <div className="w-24">Write date</div>
                <div className="w-16">Views</div>
            </div>

            {/* 테이블 바디 */}
            <div className="border border-gray-200 rounded-b-md">
                {isLoading ? (
                    <div className="p-10 text-center text-gray-500">Loading...</div>
                ) : posts.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">No announcements</div>
                ) : (
                    posts.map((item) => (
                        <div
                            key={item.announcementId}
                            onClick={() => navigate(`/main/board/${item.announcementId}`)}
                            className="flex items-center border-b border-gray-100 py-3 px-4 hover:bg-gray-50 cursor-pointer transition-colors text-center text-gray-600"
                        >
                            <div className="w-16">{item.announcementId}</div>
                            <div className="flex-1 text-left px-4 truncate font-medium text-gray-800">{item.title}</div>
                            <div className="w-24 text-sm text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</div>
                            <div className="w-16">{item.viewCount}</div>
                        </div>
                    ))
                )}
            </div>

            <div className="mt-4 flex justify-center">
                <Pagination
                    currentPage={currentPage}
                    totalItems={totalItems}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setCurrentPage}
                />
            </div>
        </div>
    );
};

export default BoardPage;
