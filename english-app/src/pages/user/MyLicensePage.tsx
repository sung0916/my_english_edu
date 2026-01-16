import apiClient from "@/api";
import { pauseLicense, resumeLicense } from "@/api/paymentApi";
import { Pagination } from "@/components/common/Pagination";
import { useEffect, useState } from "react";
import { IoCalendarOutline, IoPauseCircleOutline, IoPlayCircleOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

interface License {
    licenseId: number;
    productId: number;
    productName: string;
    status: string; // PENDING, ACTIVE, PAUSED, EXPIRED
    startedAt: string;
    expiredAt: string;
    isPaused: boolean;
}

interface PageResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    number: number; // 현재 페이지 (0부터 시작)
}

const ITEMS_PER_PAGE = 10;

const MyLicensePage = () => {
    const navigate = useNavigate();
    const [licenses, setLicenses] = useState<License[]>([]);
    const [loading, setLoading] = useState(true);
    
    // 페이지네이션 상태
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);

    // 데이터 로드
    const fetchLicenses = async (page: number) => {
        setLoading(true);
        try {
            // Page는 0부터 시작하므로 page - 1
            const response = await apiClient.get<PageResponse<License>>(`/api/licenses/my?page=${page - 1}&size=${ITEMS_PER_PAGE}`);
            setLicenses(response.data.content);
            setTotalPages(response.data.totalPages);
            setTotalItems(response.data.totalElements);
        } catch (error) {
            console.error("수강권 로드 실패", error);
            setLicenses([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLicenses(currentPage);
    }, [currentPage]);

    // 🚨 [수정 3] 클라이언트 사이드 페이지네이션 계산
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    // undefined 방지를 위해 licenses가 있을 때만 slice
    const currentLicenses = licenses ? licenses.slice(indexOfFirstItem, indexOfLastItem) : [];

    // 일시정지/재시작 핸들러 (다음 스텝에서 로직 구현 예정)
    const handleTogglePause = async (licenseId: number, isPaused: boolean) => {
        if (isPaused) {
            // 현재 일시정지 상태 -> 재시작 요청
            const confirmResume = window.confirm(
                "수강을 다시 시작하시겠습니까?\n오늘부터 남은 기간이 카운트됩니다."
            );
            if (!confirmResume) return;

            try {
                await resumeLicense(licenseId);
                alert("수강이 재시작되었습니다! 열공하세요 🔥");
                fetchLicenses(currentPage); // 목록 새로고침
            } catch (error) {
                console.error(error);
                alert("재시작 처리에 실패했습니다.");
            }

        } else {
            // 현재 수강중 상태 -> 일시정지 요청
            const confirmPause = window.confirm(
                "수강을 일시정지 하시겠습니까?\n남은 기간은 저장되며, 언제든 다시 시작할 수 있습니다."
            );
            if (!confirmPause) return;

            try {
                await pauseLicense(licenseId);
                alert("수강이 일시정지 되었습니다.");
                fetchLicenses(currentPage); // 목록 새로고침
            } catch (error) {
                console.error(error);
                alert("일시정지 처리에 실패했습니다.");
            }
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm h-full flex flex-col min-h-[600px] min-w-[925px]">
            <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <IoCalendarOutline />
                Classes
            </h1>

            {/* 테이블 헤더 */}
            <div className="flex bg-gray-50 border-y border-gray-200 py-3 px-4 font-bold text-gray-700 text-sm text-center">
                <div className="w-16">ID</div>
                <div className="flex-1 text-center pl-4">Class</div>
                <div className="w-36 hidden md:block">Start Date</div>
                <div className="w-36 hidden md:block">Expiration date</div>
                <div className="w-24">Status</div>
                <div className="w-36">Manage</div>
            </div>

            {/* 리스트 */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="py-20 text-center text-gray-400">Loading...</div>
                ) : licenses.length === 0 ? (
                    <div className="py-20 text-center text-gray-400">Don't have any class</div>
                ) : (
                    licenses.map((lic) => (
                        <div key={lic.licenseId} className="flex items-center border-b border-gray-100 py-4 px-4 hover:bg-gray-50 transition-colors">
                            {/* ID */}
                            <div className="w-16 text-center text-gray-500 text-sm">{lic.licenseId}</div>

                            {/* 상품명 (클릭 시 이동) */}
                            <div className="flex-1 text-left pl-4">
                                <button 
                                    onClick={() => navigate(`/main/store/${lic.productId}`)}
                                    className="font-medium text-gray-900 hover:text-blue-600 hover:underline text-left truncate w-full"
                                >
                                    {lic.productName}
                                </button>
                                {/* 모바일용 날짜 표시 */}
                                <div className="md:hidden text-xs text-gray-400 mt-1">
                                    {lic.startedAt} ~ {lic.expiredAt}
                                </div>
                            </div>

                            {/* 날짜 (PC) */}
                            <div className="w-36 hidden md:block text-center text-sm text-gray-600">{lic.startedAt}</div>
                            <div className="w-36 hidden md:block text-center text-sm text-gray-600">{lic.expiredAt}</div>

                            {/* 상태 뱃지 */}
                            <div className="w-24 text-center">
                                {lic.status === 'ACTIVE' && <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-bold">Active</span>}
                                {lic.status === 'PENDING' && <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-bold">Pending</span>}
                                {lic.status === 'PAUSED' && <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded-full font-bold">Paused</span>}
                                {lic.status === 'EXPIRED' && <span className="px-2 py-1 bg-red-50 text-red-400 text-xs rounded-full font-bold">Expired</span>}
                            </div>

                            {/* 관리 버튼 */}
                            <div className="w-36 flex justify-center">
                                {lic.status === 'ACTIVE' || lic.status === 'PAUSED' ? (
                                    <button 
                                        onClick={() => handleTogglePause(lic.licenseId, lic.isPaused)}
                                        className={`p-2 rounded-full transition-colors ${
                                            lic.isPaused 
                                            ? 'text-blue-600 hover:bg-blue-50' // 재시작 아이콘 스타일
                                            : 'text-orange-500 hover:bg-orange-50' // 일시정지 아이콘 스타일
                                        }`}
                                        title={lic.isPaused ? "Restart" : "Pause"}
                                    >
                                        {lic.isPaused ? <IoPlayCircleOutline size={24} /> : <IoPauseCircleOutline size={24} />}
                                    </button>
                                ) : (
                                    <span className="text-gray-300">-</span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* 페이지네이션 */}
            <div className="mt-4 flex justify-center">
                {licenses.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalItems={totalItems}
                        itemsPerPage={ITEMS_PER_PAGE}
                        onPageChange={setCurrentPage}
                    />
                )}
            </div>
        </div>
    );
};

export default MyLicensePage;
