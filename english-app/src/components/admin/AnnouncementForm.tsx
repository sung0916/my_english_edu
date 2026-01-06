import React, { useRef, useState, useEffect } from "react";
import { Editor } from '@toast-ui/react-editor';
import '@toast-ui/editor/toastui-editor.css';
import { apiClientWithFile } from "@/api";
import { crossPlatformAlert } from "@/utils/crossPlatformAlert";

interface UploadedImage {
    imageId: number;
    url: string;
    imageUrl: string;
}

// 폼 데이터 타입
export interface AnnouncementFormData {
    title: string;
    content: string; // HTML
    imageIds: number[];
}

interface AnnouncementFormProps {
    initialData?: AnnouncementFormData; // 수정 시 데이터
    onSubmit: (data: AnnouncementFormData) => Promise<void>;
    submitButtonText: string;
}

export default function AnnouncementForm({ initialData, onSubmit, submitButtonText }: AnnouncementFormProps) {
    const editorRef = useRef<Editor>(null);
    const [title, setTitle] = useState('');
    const [uploadedImageIds, setUploadedImageIds] = useState<number[]>([]);

    // 초기 데이터 로드 (수정 모드)
    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title);
            setUploadedImageIds(initialData.imageIds);
            // 에디터 내용은 initialValue로 설정하거나, 인스턴스 메서드로 설정
            if (editorRef.current) {
                editorRef.current.getInstance().setHTML(initialData.content);
            }
        }
    }, [initialData]);

    // 이미지 업로드 훅 (Editor 내부)
    const onAddImageBlob = async (blob: File | Blob, callback: (url: string, altText: string) => void) => {
        const formData = new FormData();
        formData.append('files', blob);

        try {
            const response = await apiClientWithFile.post<UploadedImage[]>('/api/images/upload', formData);
            
            if (response.data && response.data.length > 0) {
                const imageInfo = response.data[0];
                const imageUrl = imageInfo.imageUrl || imageInfo.url;
                
                // 에디터에 이미지 삽입
                callback(imageUrl, 'image');
                
                // ID 저장 (나중에 폼 전송 시 사용)
                setUploadedImageIds(prev => [...prev, imageInfo.imageId]);
            }
        } catch (error) {
            console.error("이미지 업로드 실패:", error);
            crossPlatformAlert("오류", "이미지 업로드 중 오류가 발생했습니다.");
        }
    };

    const handleSubmit = () => {
        if (!title.trim()) {
            return crossPlatformAlert("", "제목을 입력해주세요.");
        }
        
        const contentHtml = editorRef.current?.getInstance().getHTML();
        if (!contentHtml || !contentHtml.trim() || contentHtml === '<p><br></p>') {
            return crossPlatformAlert("", "내용을 입력해주세요.");
        }

        onSubmit({
            title,
            content: contentHtml,
            imageIds: uploadedImageIds
        });
    };

    return (
        <div className="flex flex-col h-full bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <input
                className="w-full p-3 mb-4 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="제목을 입력하세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            
            <div className="flex-1 border border-gray-300 rounded-md overflow-hidden min-h-[400px]">
                <Editor
                    ref={editorRef}
                    initialValue={initialData?.content || ' '}
                    placeholder="내용을 입력하세요."
                    previewStyle="vertical"
                    height="100%"
                    initialEditType="wysiwyg"
                    useCommandShortcut={true}
                    hooks={{
                        addImageBlobHook: onAddImageBlob
                    }}
                />
            </div>

            <div className="mt-4 text-right">
                <button 
                    onClick={handleSubmit}
                    className="px-6 py-3 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition-colors"
                >
                    {submitButtonText}
                </button>
            </div>
        </div>
    );
}
