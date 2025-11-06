import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import apiClient from "../../api";
import crossPlatformAlert from "../../utils/crossPlatformAlert";

const ensureQuillCss = () => {

    if (typeof document === 'undefined') return;
    if (!document.querySelector('link[data-quill-css]')) {
        
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/react-quill@2.0.0/dist/quill.snow.css';
        link.setAttribute('data-quill-css', '1');
        document.head.appendChild(link);
    }
};

// 웹 에디터는 이미지 업로드 처리가 다르지만, 일단 텍스트 저장부터 구현합니다.
const BoardWrite = () => {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState(''); // Quill 에디터의 내용은 HTML 문자열입니다.
    const [ReactQuill, setReactQuill] = useState<any>(null);
    const [isClient, setIsClient] = useState(false);

    // 클라이언트 사이드에서만 react-quill 로드
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setIsClient(true);
            import('react-quill').then((module) => {
                setReactQuill(module.default);
            });
        }
    }, []);

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
            {/* ReactQuill 컴포넌트는 클라이언트에서만 렌더링됩니다. */}
            {isClient && ReactQuill ? (
                <ReactQuill
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    style={{ height: 300, marginBottom: 50 }}
                />
            ) : (
                <View style={{ height: 300, justifyContent: 'center', alignItems: 'center' }}>
                    <Text>에디터 로딩 중...</Text>
                </View>
            )}
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
    submitButton: { backgroundColor: '#007bff', padding: 15, borderRadius: 5, alignItems: 'center', marginTop: 16 },
    submitButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});

export default BoardWrite;
