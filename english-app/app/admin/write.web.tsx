import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
// react-quill을 import 합니다. 웹에서만 사용되므로 'dynamic' import를 사용할 수도 있습니다.
import ReactQuill from 'react-quill';
// import 'react-quill/dist/quill.snow.css'; // 에디터의 기본 스타일
import crossPlatformAlert from "../../utils/crossPlatformAlert";
import apiClient from "../../api";
import { useRouter } from "expo-router";

// 웹 에디터는 이미지 업로드 처리가 다르지만, 일단 텍스트 저장부터 구현합니다.
const BoardWrite = () => {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState(''); // Quill 에디터의 내용은 HTML 문자열입니다.

    const handleSubmit = async () => {
        if (!title.trim()) {
            crossPlatformAlert("입력 필요", "제목을 입력해주세요.");
            return;
        }
        // 웹에서는 이미지 처리를 위한 별도 로직이 필요합니다. 
        // 여기서는 일단 텍스트만 전송합니다.
        try {
            await apiClient.post('/api/announcements/write', {
                title: title,
                content: content,
                imageIds: [], // 웹에서는 이미지 ID를 가져오는 방식이 다름
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
            {/* ReactQuill 컴포넌트는 웹에서만 렌더링됩니다. */}
            <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                style={{ height: 300, marginBottom: 50 }} // 웹에서는 스타일링 방식이 조금 다릅니다.
            />
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>등록</Text>
            </TouchableOpacity>
        </View>
    );
};

// React Native 스타일을 최대한 재사용합니다.
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
    submitButton: { backgroundColor: '#007bff', padding: 15, borderRadius: 5, alignItems: 'center', marginTop: 16 },
    submitButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});

export default BoardWrite;