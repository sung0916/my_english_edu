import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
// 1. [변경] react-quill 대신 react-native-cn-quill에서 컴포넌트를 가져옵니다.
import QuillEditor, { QuillToolbar } from "react-native-cn-quill";
import apiClient, { apiClientWithFile } from "../../api";
import crossPlatformAlert from "../../utils/crossPlatformAlert";

// 네이티브와 동일한 이미지 응답 타입 정의
interface UploadedImage {
    id: number;
    url: string;
    imageUrl: string;
}

const WriteWeb = () => {
    const router = useRouter();
    // 2. [추가] 에디터 인스턴스를 참조하기 위한 ref를 생성합니다.
    const editorRef = useRef<QuillEditor>(null);

    const [title, setTitle] = useState('');
    const [contentHtml, setContentHtml] = useState('');
    // 3. [추가] 업로드된 이미지 ID를 저장할 상태를 추가합니다.
    const [uploadedImageIds, setUploadedImageIds] = useState<number[]>([]);

    // 4. [추가] 커스텀 이미지 업로드 핸들러를 구현합니다. (WriteNative.tsx와 거의 동일)
    const handleImageUpload = async () => {
        const pickerResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
        });

        if (pickerResult.canceled) {
            return;
        }

        const asset = pickerResult.assets[0];
        // 웹 환경에서는 asset.uri를 fetch하여 Blob 객체로 변환해야 합니다.
        const response = await fetch(asset.uri);
        const blob = await response.blob();

        const formData = new FormData();
        formData.append('files', blob, asset.fileName || 'image.jpg');

        try {
            const uploadResponse = await apiClientWithFile.post<UploadedImage[]>('/api/images/upload', formData);

            if (uploadResponse.data && uploadResponse.data.length > 0) {
                const uploadedImage = uploadResponse.data[0];
                const imageUrlToInsert = uploadedImage.imageUrl || uploadedImage.url;

                // 에디터의 현재 커서 위치에 이미지를 삽입합니다.
                if (editorRef.current) {
                    const selection = await editorRef.current.getSelection();
                    const index = selection ? selection.index : 0;  // selection이 없을 경우
                    editorRef.current?.insertEmbed(index, 'image', imageUrlToInsert);
                }

                // 이미지 ID를 상태에 저장합니다.
                setUploadedImageIds(prevIds => [...prevIds, uploadedImage.id]);
            }
        } catch (error) {
            console.error("웹 이미지 업로드 실패:", error);
            crossPlatformAlert("오류", "이미지 업로드에 실패했습니다.");
        }
    };

    const handleSubmit = async () => {
        if (!title.trim()) {
            crossPlatformAlert("입력 필요", "제목을 입력해주세요.");
            return;
        }
        if (!contentHtml.trim() || contentHtml === '<p><br></p>') {
            crossPlatformAlert("입력 필요", "내용을 입력해주세요.");
            return;
        }

        try {
            // 5. [수정] imageIds를 함께 전송하도록 수정합니다.
            await apiClient.post('/api/announcements/write', {
                title: title,
                content: contentHtml,
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
        <View style={styles.container}>
            <TextInput
                style={styles.titleInput}
                placeholder="제목을 입력하세요"
                value={title}
                onChangeText={setTitle}
            />
            
            {/* 6. [변경] 기존 동적 로딩 로직을 QuillToolbar와 QuillEditor로 교체합니다. */}
            <View style={styles.editorContainer}>
                <QuillToolbar
                    editor={editorRef as any}
                    options={[
                        ['bold', 'italic', 'underline'],
                        [{ 'header': 1 }, { 'header': 2 }],
                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                        // 'image' 옵션을 추가하면 기본 이미지 핸들러가 동작하므로,
                        // 커스텀 핸들러를 연결하기 위해 custom 옵션을 사용합니다.
                        { custom: { handler: handleImageUpload, icon: 'image' } }
                    ]}
                    theme="light"
                />
                <QuillEditor
                    ref={editorRef}
                    style={styles.editor}
                    initialHtml={contentHtml}
                    onHtmlChange={({ html }) => setContentHtml(html)}
                />
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>등록</Text>
            </TouchableOpacity>
        </View>
    );
};

// 7. [수정] 에디터에 맞는 스타일을 추가/조정합니다.
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', padding: 16 },
    titleInput: {
        borderWidth: 1,
        borderColor: '#dee2e6',
        padding: 10,
        fontSize: 16,
        borderRadius: 4,
        marginBottom: 16,
    },
    editorContainer: {
        flex: 1, // 에디터가 남은 공간을 모두 차지하도록
        borderWidth: 1,
        borderColor: '#dee2e6',
        borderRadius: 4,
        overflow: 'hidden' // 자식 컴포넌트가 부모 경계를 넘지 않도록
    },
    editor: {
        flex: 1,
        paddingHorizontal: 10,
        backgroundColor: 'white',
    },
    submitButton: { 
        backgroundColor: '#007bff', 
        padding: 15, 
        borderRadius: 5, 
        alignItems: 'center', 
        marginTop: 16 
    },
    submitButtonText: { 
        color: 'white', 
        fontSize: 16, 
        fontWeight: 'bold' 
    },
});

export default WriteWeb;
