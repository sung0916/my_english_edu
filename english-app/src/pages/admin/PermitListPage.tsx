import React, { useCallback, useEffect, useState } from "react";
import apiClient from "@/api";
import { Pagination } from "@/components/common/Pagination";
import PermitCustomButton from "@/components/common/PosButtonProps";
import RefuseCustomButton from "@/components/common/NegButtonProps";
import { crossPlatformAlert } from "@/utils/crossPlatformAlert";

const ITEMS_PER_PAGE = 5;
type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN';

interface PendingUser {
    userId: number;
    username: string;
    loginId: string;
    tel: string;
    role: UserRole | null;
    status: string;
}

const PermitListPage = () => {
    const [allPendingUsers, setAllPendingUsers] = useState<PendingUser[]>([]);
    const [displayedUsers, setDisplayedUsers] = useState<PendingUser[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRoles, setSelectedRoles] = useState<{ [key: number]: UserRole }>({});

    const fetchPendingUsers = useCallback(async () => {
        try {
            const response = await apiClient.get<PendingUser[]>('/api/admin/pending');
            setAllPendingUsers(response.data);
            
            const initialRoles: { [key: number]: UserRole } = {};
            response.data.forEach(user => {
                initialRoles[user.userId] = 'STUDENT';
            });
            setSelectedRoles(initialRoles);
        } catch (error) {
            console.error("로드 실패:", error);
        }
    }, []);

    useEffect(() => {
        fetchPendingUsers();
    }, [fetchPendingUsers]);

    useEffect(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        setDisplayedUsers(allPendingUsers.slice(startIndex, endIndex));
    }, [allPendingUsers, currentPage]);

    const handleRoleChange = (userId: number, role: UserRole) => {
        setSelectedRoles(prev => ({ ...prev, [userId]: role }));
    };

    const handleApprove = async (userId: number) => {
        const role = selectedRoles[userId];
        try {
            await apiClient.patch(`/api/admin/${userId}/approve`, { role });
            crossPlatformAlert("Success", "");
            setAllPendingUsers(prev => prev.filter(u => u.userId !== userId));
        } catch (error) {
            crossPlatformAlert("Failed", "Try again");
        }
    };

    const handleRemove = async (userId: number) => {
        try {
            await apiClient.delete(`/api/admin/${userId}`);
            crossPlatformAlert("Sucess to delete", "");
            setAllPendingUsers(prev => prev.filter(u => u.userId !== userId));
        } catch (error) {
            crossPlatformAlert("Failed", "Try again");
        }
    };

    return (
        <div className="bg-white min-w-[720px] p-6 rounded-lg shadow-sm min-h-full flex flex-col">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Awaiting Approval</h2>

            <div className="flex flex-row bg-gray-50 border-b-2 border-gray-200 py-3 px-2 font-bold text-gray-700 text-center">
                <div className="flex-[1.5]">Name</div>
                <div className="flex-[2]">ID</div>
                <div className="flex-[2.5]">Contact</div>
                <div className="flex-[2]">Position</div>
                <div className="flex-[3]">Status</div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {displayedUsers.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">No accounts in list</div>
                ) : (
                    displayedUsers.map((item) => (
                        <div key={item.userId} className="flex flex-row items-center border-b border-gray-100 py-3 px-2 text-center hover:bg-gray-50">
                            <div className="flex-[1.5]">{item.username}</div>
                            <div className="flex-[2] text-gray-600">{item.loginId}</div>
                            <div className="flex-[2.5] text-gray-600">{item.tel}</div>
                            <div className="flex-[2] flex justify-center">
                                <select 
                                    value={selectedRoles[item.userId] || 'STUDENT'}
                                    onChange={(e) => handleRoleChange(item.userId, e.target.value as UserRole)}
                                    className="border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:border-blue-500 bg-white"
                                >
                                    <option value="STUDENT">STUDENT</option>
                                    <option value="TEACHER">TEACHER</option>
                                    <option value="ADMIN">ADMIN</option>
                                </select>
                            </div>
                            <div className="flex-[3] flex justify-center gap-2">
                                <PermitCustomButton title="Permit" onClick={() => handleApprove(item.userId)} className="px-3 py-1 text-sm w-20" />
                                <RefuseCustomButton title="Refuse" onClick={() => handleRemove(item.userId)} className="px-3 py-1 text-sm w-20" />
                            </div>
                        </div>
                    ))
                )}
            </div>

            {allPendingUsers.length > 0 && (
                <div className="mt-4 flex justify-center">
                    <Pagination
                        currentPage={currentPage}
                        totalItems={allPendingUsers.length}
                        itemsPerPage={ITEMS_PER_PAGE}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )}
        </div>
    );
};

export default PermitListPage;
