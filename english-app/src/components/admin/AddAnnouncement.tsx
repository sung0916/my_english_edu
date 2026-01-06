import React from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "@/api";
import { crossPlatformAlert } from "@/utils/crossPlatformAlert";
import AnnouncementForm, { AnnouncementFormData } from "@/components/admin/AnnouncementForm";

const AddAnnouncement = () => {
    const navigate = useNavigate();

    const handleCreate = async (data: AnnouncementFormData) => {
        try {
            await apiClient.post('/api/announcements/write', {
                title: data.title,
                content: data.content,
                imageIds: data.imageIds,
            });
            crossPlatformAlert("성공", "공지사항이 등록되었습니다.");
            navigate(-1); // 뒤로 가기
        } catch (error) {
            console.error("공지사항 등록 실패:", error);
            crossPlatformAlert("오류", "등록에 실패했습니다.");
        }
    };

    return (
        <div className="h-[calc(100vh-80px)] p-6 bg-gray-50">
            <AnnouncementForm 
                onSubmit={handleCreate} 
                submitButtonText="등록" 
            />
        </div>
    );
};

export default AddAnnouncement;
