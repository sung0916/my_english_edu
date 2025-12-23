import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { RichEditor, RichToolbar, actions } from "react-native-pell-rich-editor";
import apiClient, { apiClientWithFile } from "../../api";
import { crossPlatformAlert } from "../../utils/crossPlatformAlert";

// 업로드된 이미지의 응답 타입을 정의합니다. (백엔드 ImageResponse DTO 참고)
interface UploadedImage {
    imageId: number;
    url: string; // 에디터에 삽입될 URL
    imageUrl: string; // imageUrl 필드가 있다면 그것을 사용
}

const WriteNative = () => {
    const editorRef = useRef<RichEditor>(null);
    const router = useRouter();

    const [title, setTitle] = useState('');
    // 업로드된 이미지들의 ID를 저장할 상태
    const [uploadedImageIds, setUploadedImageIds] = useState<number[]>([]);

    const handleImageUpload = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
            crossPlatformAlert("권한 필요", "이미지를 업로드하려면 사진첩 접근 권한이 필요합니다.");
            return;
        }

        const pickerResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
        });

        if (pickerResult.canceled) {
            return;
        }

        const asset = pickerResult.assets[0];
        const formData = new FormData();
        
        // [수정된 부분] mimeType 오류를 해결하는 안정적인 코드
        const file = {
            uri: asset.uri,
            name: asset.fileName || 'image.jpg',
            type: asset.type ? `image/${asset.type}` : 'image/jpeg', // asset.type을 사용
        };
        formData.append('files', file as any);

        try {
            const response = await apiClientWithFile.post<UploadedImage[]>('/api/images/upload', formData);
            
            if (response.data && response.data.length > 0) {
                const uploadedImage = response.data[0];
                // 백엔드 응답 필드명(imageUrl 또는 url)에 맞춰주세요.
                const imageUrlToInsert = uploadedImage.imageUrl || uploadedImage.url;

                editorRef.current?.insertImage(imageUrlToInsert);

                // 업로드 성공 시, 반환된 이미지 ID를 상태에 추가
                setUploadedImageIds(prevIds => [...prevIds, uploadedImage.imageId]);
            }
        } catch (error) {
            console.error("이미지 업로드 실패:", error);
            crossPlatformAlert("오류", "이미지 업로드에 실패했습니다.");
        }
    };

    const handleSubmit = async () => {
        if (!title.trim()) {
            crossPlatformAlert("", "제목을 입력해주세요.");
            return;
        }
        const htmlContent = await editorRef.current?.getContentHtml() || '';
        if (!htmlContent.trim() || htmlContent === '<br>') {
            crossPlatformAlert("", "내용을 입력해주세요.");
            return;
        }

        try {
            // [API 연동] 백엔드에 제목, 내용, 이미지 ID 목록 전송
            await apiClient.post('/api/announcements/write', {
                title: title,
                content: htmlContent,
                imageIds: uploadedImageIds,
            });
            
            crossPlatformAlert("성공", "공지사항이 성공적으로 등록되었습니다.");
            router.back(); // 등록 성공 후 목록으로 돌아가기

        } catch (error) {
            console.error("공지사항 등록 실패:", error);
            crossPlatformAlert("오류", "공지사항 등록에 실패했습니다.");
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
            <RichToolbar
                editor={editorRef}
                actions={[
                    actions.setBold,
                    actions.setItalic,
                    actions.setUnderline,
                    actions.insertBulletsList,
                    actions.insertOrderedList,
                    'insertImage'
                ]}
                iconMap={{
                    insertImage: () => <Ionicons name="image-outline" size={24} color="#495057" />,
                }}
                onPressAddImage={handleImageUpload}
                style={styles.toolbar}
            />
            <ScrollView style={styles.editorContainer}>
                <RichEditor
                    ref={editorRef}
                    placeholder="내용을 입력해주세요..."
                    style={styles.editor}
                />
            </ScrollView>
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>등록</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', padding: 16 },
    titleInput: {
        borderWidth: 1,
        borderColor: '#dee2e6',
        padding: 10,
        fontSize: 16,
        borderRadius: 4,
        marginBottom: 10,
    },
    toolbar: { backgroundColor: '#f8f9fa', borderBottomWidth: 1, borderColor: '#dee2e6' },
    editorContainer: { flex: 1, borderWidth: 1, borderColor: '#dee2e6', marginTop: -1 },
    editor: { minHeight: 300 },
    submitButton: { backgroundColor: '#007bff', padding: 15, borderRadius: 5, alignItems: 'center', marginTop: 16 },
    submitButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});

export default WriteNative;
