import { useUIStore } from "@/store/uiStore";
import { FiMenu } from "react-icons/fi";

const AdminHeader = () => {
    const { toggleSidebar } = useUIStore();

    return (
        <header className="h-16 flex items-center justify-between px-4 border-b border-gray-200 bg-white sticky top-0 z-20">
            {/* 모바일 햄버거 버튼 */}
            <button 
                onClick={toggleSidebar} 
                className="p-2 mr-2 rounded-md hover:bg-gray-100 md:hidden"
            >
                <FiMenu size={24} color="black" />
            </button>

            <h1 className="text-lg font-bold text-gray-800">관리자 페이지</h1>

            {/* 오른쪽 여백 (균형 맞춤용) */}
            <div className="w-8" />
        </header>
    );
};

export default AdminHeader;
