import { NavLink } from "react-router-dom";
import { useUIStore } from "@/store/uiStore";

const menuItems = [
    { name: 'My Classes', href: '/user/myClass' },
    { name: 'Places', href: '/user/place' },
    { name: 'Results', href: '/user/result' },
    { name: 'Order History', href: '/user/payment' },
    { name: 'Edit Profile', href: '/auth/confirm-edit' },
    { name: 'Withdraw Account', href: '/auth/confirm-withdraw', isDanger: true },
];

const UserSidebar = () => {
    const { isSidebarOpen, toggleSidebar } = useUIStore();

    // 모바일에서 메뉴 클릭 시 사이드바 닫기 (선택 사항)
    const handleMenuClick = () => {
        if (window.innerWidth < 768) { 
            toggleSidebar(); // 닫기 동작 호출 (필요한 경우 구현)
        }
    };

    return (
        <>
            {/* 모바일용 오버레이 (사이드바 열렸을 때 배경 어둡게) */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={toggleSidebar}
                />
            )}

            <aside 
                className={`
                    fixed md:sticky top-0 left-0 h-screen w-64 bg-gray-50 border-r border-gray-200 
                    transform transition-transform duration-300 ease-in-out z-40
                    pt-16 md:pt-4  
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                    md:translate-x-0 
                `}
            >
                <nav className="flex flex-col p-4 space-y-2">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.href}
                            onClick={handleMenuClick}
                            className={({ isActive }) => `
                                block px-4 py-3 rounded-lg text-center font-semibold transition-colors
                                ${item.isDanger ? 'text-red-500 hover:bg-red-50' : 'text-gray-600 hover:bg-gray-200'}
                                ${isActive && !item.isDanger ? 'bg-blue-100 text-blue-600 font-bold' : ''}
                            `}
                        >
                            {item.name}
                        </NavLink>
                    ))}
                </nav>
            </aside>
        </>
    );
};

export default UserSidebar;
