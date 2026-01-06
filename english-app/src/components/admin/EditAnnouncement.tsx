import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "@/api";
import { crossPlatformAlert } from "@/utils/crossPlatformAlert";
import AnnouncementForm, { AnnouncementFormData } from "@/components/admin/AnnouncementForm";

interface AnnouncementDetail {
    id: number;
    title: string;
    content: string;
    // 필요한 경우 이미지 ID 목록 등을 백엔드에서 받아와야 함
    imageIds?: number[]; 
}

const EditAnnouncement = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [initialData, setInitialData] = useState<AnnouncementFormData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAnnouncement = async () => {
            try {
                const response = await apiClient.get<AnnouncementDetail>(`/api/announcements/${id}`);
                const data = response.data;

                setInitialData({
                    title: data.title,
                    content: data.content,
                    imageIds: data.imageIds || [], // 기존 이미지 ID가 없다면 빈 배열
                });
            } catch (error) {
                console.error("로드 실패:", error);
                crossPlatformAlert("오류", "공지사항을 불러오지 못했습니다.");
                navigate(-1);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchAnnouncement();
    }, [id, navigate]);

    const handleEdit = async (data: AnnouncementFormData) => {
        try {
            await apiClient.patch(`/api/announcements/${id}`, {
                title: data.title,
                content: data.content,
                imageIds: data.imageIds,
            });
            crossPlatformAlert("성공", "공지사항이 수정되었습니다.");
            navigate(-1);
        } catch (error) {
            console.error("수정 실패:", error);
            crossPlatformAlert("오류", "수정에 실패했습니다.");
        }
    };

    if (isLoading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="h-[calc(100vh-80px)] p-6 bg-gray-50">
            {initialData && (
                <AnnouncementForm 
                    initialData={initialData}
                    onSubmit={handleEdit} 
                    submitButtonText="수정 완료" 
                />
            )}
        </div>
    );
};

export default EditAnnouncement;
