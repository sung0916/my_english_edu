import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from '@/api';
import PermitCustomButton from '@/components/common/PosButtonProps';
import RefuseCustomButton from '@/components/common/NegButtonProps';
import { useUserStore } from '@/store/userStore';
import { crossPlatformAlert, crossPlatformConfirm } from '@/utils/crossPlatformAlert';

interface AnnouncementImage {
    id: number;
    imageUrl: string;
}

interface Author {
    userId: number;
    username: string;
}

interface Announcement {
    id: number;
    title: string;
    content: string;
    author: Author;
    createdAt: string;
    viewCount: number;
    images: AnnouncementImage[];
}

export default function BoardDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useUserStore();
    const [announcement, setAnnouncement] = useState<Announcement | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) {
            const fetchAnnouncement = async () => {
                try {
                    const response = await apiClient.get<Announcement>(`/api/announcements/${id}`);
                    setAnnouncement(response.data);
                } catch (error) {
                    console.error("로드 실패:", error);
                    crossPlatformAlert("오류", "데이터를 불러올 수 없습니다.");
                } finally {
                    setIsLoading(false);
                }
            };
            fetchAnnouncement();
        }
    }, [id]);

    const handleEdit = () => {
        navigate(`/admin/editAnnouncement/${id}`);
    };

    const handleDelete = () => {
        if (!announcement) return;

        crossPlatformConfirm(
            "삭제 확인",
            `'${announcement.title}' 게시글을 삭제하시겠습니까?`,
            async () => {
                try {
                    await apiClient.delete(`/api/announcements/${id}`);
                    crossPlatformAlert("성공", "삭제되었습니다.");
                    navigate(-1);
                } catch (error) {
                    crossPlatformAlert("오류", "삭제 실패");
                }
            }
        );
    };

    if (isLoading) return <div className="p-10 text-center">Loading...</div>;
    if (!announcement) return <div className="p-10 text-center">게시글을 찾을 수 없습니다.</div>;

    return (
        <div className="min-w-[800px] mx-auto p-6 bg-white min-h-screen">
            <div className="border-b border-gray-200 pb-4 mb-6">
                <h1 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">{announcement.title}</h1>
                <div className="flex justify-between text-sm text-gray-500">
                    <div className="flex gap-4">
                        <span>Written by: <span className="font-medium text-gray-700">{announcement.author.username}</span></span>
                        <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div>Views {announcement.viewCount}</div>
                </div>
            </div>

            {user?.role === 'ADMIN' && (
                <div className="flex justify-end gap-2 mb-6">
                    <PermitCustomButton title="수정" onClick={handleEdit} className="px-4 py-1 text-sm" />
                    <RefuseCustomButton title="삭제" onClick={handleDelete} className="px-4 py-1 text-sm" />
                </div>
            )}

            <div className="min-h-[300px]">
                {/* HTML 렌더링 */}
                <div 
                    className="prose max-w-none text-gray-800 leading-relaxed ql-editor" // ql-editor는 Toast UI Editor 스타일 호환용 클래스
                    dangerouslySetInnerHTML={{ __html: announcement.content }}
                />
            </div>
        </div>
    );
}
