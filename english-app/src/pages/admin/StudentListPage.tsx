import React, { useCallback, useEffect, useState } from "react";
import { IoTrashOutline } from "react-icons/io5";
import apiClient from "@/api";
import { Pagination } from "@/components/common/Pagination";
import { SearchBox, SearchOption } from "@/components/common/SearchBox";
import { crossPlatformAlert, crossPlatformConfirm } from "@/utils/crossPlatformAlert";

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
    const searchOptions: SearchOption[] = [{ value: 'userName', label: '이름' }];
    const [allStudents, setAllStudents] = useState<Student[]>([]);
    const [displayedStudents, setDisplayedStudents] = useState<Student[]>([]);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchStudents = useCallback(async () => {
        try {
            const response = await apiClient.get<Student[]>('/api/admin');
            const filtered = response.data.filter(u => u.role === 'STUDENT' && (u.status === 'ACTIVE' || u.status === 'DELETED'));
            setAllStudents(filtered);
        } catch (error) {
            console.error(error);
        }
    }, []);

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    useEffect(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        setDisplayedStudents(allStudents.slice(start, start + ITEMS_PER_PAGE));
    }, [allStudents, currentPage]);

    const handleDelete = (userId: number, username: string) => {
        crossPlatformConfirm("학생 삭제", `'${username}' 학생을 삭제하시겠습니까?`, async () => {
            try {
                await apiClient.delete(`/api/admin/${userId}`);
                setAllStudents(prev => prev.map(s => s.id === userId ? { ...s, status: 'DELETED' } : s));
                crossPlatformAlert("성공", "삭제되었습니다.");
            } catch (error) {
                crossPlatformAlert("오류", "실패했습니다.");
            }
        });
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm min-h-full flex flex-col">
            <div className="mb-4">
                <SearchBox options={searchOptions} onSearch={() => {}} />
            </div>

            <div className="flex flex-row bg-gray-50 border-b-2 border-gray-200 py-3 px-2 font-bold text-gray-700 text-center">
                <div className="flex-[1.5]">이름</div>
                <div className="flex-[2]">아이디</div>
                <div className="flex-[2.5]">연락처</div>
                <div className="flex-[3]">이메일</div>
                <div className="flex-[1.2]">삭제</div>
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
                                    <span className="text-xs italic">삭제됨</span>
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
