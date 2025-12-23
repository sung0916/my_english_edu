import { Editor } from '@toast-ui/react-editor';
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import apiClient, { apiClientWithFile } from "../../api";
import { crossPlatformAlert } from "../../utils/crossPlatformAlert";

// 1. Editor 타입을 import 합니다. (ref 타입 지정을 위해)
// import { Editor } from '@toast-ui/react-editor';

interface UploadedImage {
    imageId: number;
    url: string;
    imageUrl: string;
}

const WriteWeb = () => {
    const router = useRouter();
    // 2. ref의 타입을 Editor로 지정합니다.
    const editorRef = useRef<Editor>(null);

    const [title, setTitle] = useState('');
    const [uploadedImageIds, setUploadedImageIds] = useState<number[]>([]);

    const handleSubmit = async () => {
        if (!title.trim()) {
            crossPlatformAlert("", "제목을 입력해주세요.");
            return;
        }
        
        // 3. 에디터의 내용을 가져옵니다.
        //const contentMarkdown = editorRef.current?.getInstance().getMarkdown();
        const contentHtml = editorRef.current?.getInstance().getHTML();
        if (!contentHtml || !contentHtml.trim()) {
            crossPlatformAlert("", "내용을 입력해주세요.");
            return;
        }

        try {
            await apiClient.post('/api/announcements/write', {
                title: title,
                content: contentHtml, // 마크다운 텍스트를 전송
                imageIds: uploadedImageIds,
            });
            crossPlatformAlert("성공", "공지사항이 등록되었습니다.");
            router.back();
        } catch (error) {
            console.error("공지사항 등록 실패:", error);
            crossPlatformAlert("오류", "등록에 실패했습니다.");
        }
    };

    return (
        <div style={styles.container}>
            <input
                style={styles.titleInput}
                placeholder="제목을 입력하세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            
            {/* 4. TOAST UI 에디터를 렌더링합니다. */}
            <Editor
                ref={editorRef}
                initialValue=" " // 공백을 넣어 placeholder가 보이도록 함
                placeholder="내용을 입력하세요."
                previewStyle="vertical" // 미리보기 스타일 (탭 또는 수직 분할)
                height="100%" // 부모 요소의 높이를 꽉 채움
                initialEditType="wysiwyg" // 초기 모드 (wysiwyg 또는 markdown)
                useCommandShortcut={true}
                // 5. 이미지 업로드 훅(hook)을 정의합니다.
                hooks={{
                    addImageBlobHook: async (blob: File | Blob, callback: (url: string, altText: string) => void) => {
                        const formData = new FormData();
                        formData.append('files', blob);

                        try {
                            const response = await apiClientWithFile.post<UploadedImage[]>('/api/images/upload', formData);
                            
                            if (response.data && response.data.length > 0) {
                                const imageInfo = response.data[0];
                                const imageUrl = imageInfo.imageUrl || imageInfo.url;
                                
                                // 업로드된 이미지 URL을 에디터에 전달합니다.
                                callback(imageUrl, 'image');
                                
                                setUploadedImageIds(prevIds => [...prevIds, imageInfo.imageId]);
                            }
                        } catch (error) {
                            console.error("이미지 업로드 실패:", error);
                            crossPlatformAlert("오류", "이미지 업로드 중 오류가 발생했습니다.");
                        }
                    }
                }}
            />

            <button style={styles.submitButton} onClick={handleSubmit}>
                등록
            </button>
        </div>
    );
};

// 웹 CSS 표준에 맞는 스타일
const styles = {
    container: { 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%', 
        padding: '16px', 
        backgroundColor: '#fff', 
        boxSizing: 'border-box' 
    } as React.CSSProperties,
    titleInput: { 
        border: '1px solid #dee2e6', 
        padding: '10px', 
        fontSize: '16px', 
        borderRadius: '4px', 
        marginBottom: '16px', 
        boxSizing: 'border-box' 
    } as React.CSSProperties,
    submitButton: { 
        backgroundColor: '#007bff', 
        color: 'white', 
        padding: '15px', 
        borderRadius: '5px', 
        textAlign: 'center', 
        fontSize: '16px', 
        fontWeight: 'bold', 
        border: 'none', 
        cursor: 'pointer', 
        marginTop: '16px' 
    } as React.CSSProperties,
};

export default WriteWeb;
