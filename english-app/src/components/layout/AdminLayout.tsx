import { Outlet } from "react-router-dom";
import AdminHeader from "@/components/admin/AdminHeader"; 
import AdminSidebar from "@/components/admin/AdminSidebar"; 

const AdminLayout = () => {
    return (
        <div className="flex flex-col min-h-screen bg-white">
            <AdminHeader />

            <div className="flex flex-1 relative">
                <AdminSidebar />

                {/* 메인 콘텐츠 영역 */}
                <main className="flex-1 w-full bg-[#f8f9fa] overflow-y-auto">
                    <div className="p-4 md:p-6 w-full max-w-7xl mx-auto h-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
