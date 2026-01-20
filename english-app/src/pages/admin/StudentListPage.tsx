import React, { useCallback, useEffect, useState } from "react";
import { IoTrashOutline } from "react-icons/io5";
import apiClient from "@/api";
import { Pagination } from "@/components/common/Pagination";
import { SearchBox, SearchOption } from "@/components/common/SearchBox";
import { crossPlatformAlert, crossPlatformConfirm } from "@/utils/crossPlatformAlert";
import { useSearch } from "@/hooks/useSearch";

const ITEMS_PER_PAGE = 10;

interface Student {
    id: number;
    username: string;
    loginId: string;
    tel: string;
    email: string;
    status: 'ACTIVE' | 'DELETED';
    role: 'STUDENT' | 'TEACHER';
}

const StudentListPage = () => {
    const searchOptions: SearchOption[] = [{ value: 'userName', label: 'Name' }];
    const [allStudents, setAllStudents] = useState<Student[]>([]);
    const [displayedStudents, setDisplayedStudents] = useState<Student[]>([]);
    const [currentPage, setCurrentPage] = useState(1);

    const { onSearch, searchState } = useSearch('userName');

    const fetchStudents = useCallback(async () => {
        try {
            const params: any = {};
            if (searchState.keyword) {
                params.keyword = searchState.keyword;
            }
            const response = await apiClient.get<Student[]>('/api/admin', { params });
            const filtered = response.data.filter(u => u.role === 'STUDENT' && (u.status === 'ACTIVE' || u.status === 'DELETED'));
            setAllStudents(filtered);
            setCurrentPage(1);

        } catch (error) {
            console.error(error);
            crossPlatformAlert("Failed to load students", "");
        }
    }, [searchState]);

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    useEffect(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        setDisplayedStudents(allStudents.slice(start, start + ITEMS_PER_PAGE));
    }, [allStudents, currentPage]);

    const handleDelete = (userId: number, username: string) => {
        crossPlatformConfirm("Delete student", `Are you sure to delete '${username}'?`, async () => {
            try {
                await apiClient.delete(`/api/admin/${userId}`);
                setAllStudents(prev => prev.map(s => s.id === userId ? { ...s, status: 'DELETED' } : s));
                crossPlatformAlert("Success", "Student deleted");
            } catch (error) {
                crossPlatformAlert("Failed", "Try again");
            }
        });
    };

    return (
        <div className="bg-white min-w-[720px] p-6 rounded-lg shadow-sm min-h-full flex flex-col">
            <div className="mb-4">
                <SearchBox options={searchOptions} onSearch={onSearch} />
            </div>

            <div className="flex flex-row bg-gray-50 border-b-2 border-gray-200 py-3 px-2 font-bold text-gray-700 text-center">
                <div className="flex-[1.5]">Name</div>
                <div className="flex-[2]">ID</div>
                <div className="flex-[2.5]">Contact</div>
                <div className="flex-[3]">Email</div>
                <div className="flex-[1.2]">Delete</div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {displayedStudents.map((item) => {
                    const isDeleted = item.status === 'DELETED';
                    return (
                        <div key={item.id} className={`flex flex-row items-center border-b border-gray-100 py-3 px-2 text-center ${isDeleted ? 'bg-gray-50 text-gray-400' : 'hover:bg-gray-50'}`}>
                            <div className="flex-[1.5]">{item.username}</div>
                            <div className="flex-[2]">{isDeleted ? '-' : item.loginId}</div>
                            <div className="flex-[2.5]">{isDeleted ? '-' : item.tel}</div>
                            <div className="flex-[3] truncate px-2">{isDeleted ? '-' : item.email}</div>
                            <div className="flex-[1.2] flex justify-center">
                                {isDeleted ? (
                                    <span className="text-xs italic">deleted</span>
                                ) : (
                                    <button onClick={() => handleDelete(item.id, item.username)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-full">
                                        <IoTrashOutline size={20} />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 flex justify-center">
                <Pagination currentPage={currentPage} totalItems={allStudents.length} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setCurrentPage} />
            </div>
        </div>
    );
};

export default StudentListPage;
