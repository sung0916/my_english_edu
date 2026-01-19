import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoTrashOutline, IoPencil } from "react-icons/io5";
import apiClient from "@/api";
import { Pagination } from "@/components/common/Pagination";
import { SearchBox, SearchOption } from "@/components/common/SearchBox";
import { crossPlatformAlert, crossPlatformConfirm } from "@/utils/crossPlatformAlert";

const ITEMS_PER_PAGE = 10;

interface Announcement {
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

const BoardListPage = () => {
    const navigate = useNavigate();
    const boardSearchOptions: SearchOption[] = [
        { value: 'title', label: 'Title' },
        { value: 'content', label: 'Content' },
    ];

    const [isLoading, setIsLoading] = useState(true);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const fetchAnnouncements = useCallback(async (page: number) => {
        setIsLoading(true);
        try {
            const response = await apiClient.get<Page<Announcement>>('/api/announcements/list', {
                params: {
                    page: page - 1,
                    size: ITEMS_PER_PAGE,
                    sort: 'id,desc',
                }
            });
            setAnnouncements(response.data.content);
            setTotalItems(response.data.totalElements);
        } catch (error) {
            console.error("로드 실패:", error);
            crossPlatformAlert("Failed", "Try again");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAnnouncements(currentPage);
    }, [currentPage, fetchAnnouncements]);

    const handleSearch = (type: string, query: string) => {
        console.log(`검색: ${type}, ${query}`);
    };

    const handleDelete = (id: number, title: string) => {
        crossPlatformConfirm(
            "Delete Announcement",
            `Do you want to remove '${title}'?`,
            async () => {
                try {
                    await apiClient.delete(`/api/announcements/${id}`);
                    crossPlatformAlert("Success", "");
                    fetchAnnouncements(currentPage);
                } catch (error) {
                    crossPlatformAlert("Failed", "Try again");
                }
            }
        );
    };

    return (
        <div className="bg-white min-w-[720px] p-6 rounded-lg shadow-sm h-full flex flex-col">
            <div className="mb-4">
                <SearchBox options={boardSearchOptions} onSearch={handleSearch} />
            </div>

            {/* 테이블 헤더 */}
            <div className="flex flex-row bg-gray-50 border-b-2 border-gray-200 py-3 px-2 font-bold text-gray-700 text-center">
                <div className="flex-1">No</div>
                <div className="flex-[4]">Title</div>
                <div className="flex-[1.5]">Written by</div>
                <div className="flex-[2]">Posted at</div>
                <div className="flex-1">Views</div>
                <div className="flex-[1.5]">Delete</div>
            </div>

            {/* 테이블 바디 */}
            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="p-10 text-center text-gray-500">Loading...</div>
                ) : announcements.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">등록된 공지사항이 없습니다.</div>
                ) : (
                    announcements.map((item) => (
                        <div 
                            key={item.announcementId} 
                            className="flex flex-row items-center border-b border-gray-100 py-3 px-2 hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => navigate(`/main/board/${item.announcementId}`)}
                        >
                            <div className="flex-1 text-center">{item.announcementId}</div>
                            <div className="flex-[4] px-2 truncate font-medium text-gray-800">{item.title}</div>
                            <div className="flex-[1.5] text-center text-gray-600">{item.authorName}</div>
                            <div className="flex-[2] text-center text-gray-500 text-sm">
                                {new Date(item.createdAt).toLocaleDateString()}
                            </div>
                            <div className="flex-1 text-center text-gray-500">{item.viewCount}</div>
                            <div className="flex-[1.5] flex justify-center" onClick={(e) => e.stopPropagation()}>
                                <button 
                                    onClick={() => handleDelete(item.announcementId, item.title)}
                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                >
                                    <IoTrashOutline size={20} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* 하단 버튼 & 페이지네이션 */}
            <div className="mt-4 flex flex-col items-end gap-2">
                <button 
                    onClick={() => navigate('/admin/write')}
                    className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                >
                    <IoPencil />
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

export default BoardListPage;
