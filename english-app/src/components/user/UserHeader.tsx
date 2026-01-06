import { useUIStore } from "@/store/uiStore";
import { FiMenu } from "react-icons/fi"; // Feather Icon 대체

const UserHeader = () => {
    const { toggleSidebar } = useUIStore();

    return (
        <header className="h-16 flex flex-row items-center justify-between px-4 border-b border-gray-200 bg-white sticky top-0 z-20">
            {/* 모바일 햄버거 버튼 (md:hidden -> 768px 이상에서는 숨김) */}
            <button 
                onClick={toggleSidebar} 
                className="p-2 mr-2 rounded-md hover:bg-gray-100 md:hidden"
            >
                <FiMenu size={24} color="black" />
            </button>

            <h1 className="text-lg font-bold text-gray-800">My Page</h1>

            {/* 오른쪽 여백 균형을 위한 더미 요소 (필요 시 프로필 아이콘 등으로 대체 가능) */}
            <div className="w-11" />
        </header>
    );
};

export default UserHeader;
