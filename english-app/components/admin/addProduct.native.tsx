import apiClient, { apiClientWithFile } from "@/api";
import { crossPlatformAlert } from "@/utils/crossPlatformAlert";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { actions, RichEditor, RichToolbar } from "react-native-pell-rich-editor";

// 백엔드 ProductType Enum과 동일하게 정의
type ProductType = 'SUBSCRIPTION' | 'ITEM';

interface UploadedImage {
    imageId: number;
    url: string; // 에디터에 삽입될 URL
    imageUrl: string; // imageUrl 필드가 있다면 그것을 사용
}

const AddProductNative = () => {
    const router = useRouter();
    const editorRef = useRef<RichEditor>(null);
    const [productName, setProductName] = useState('');
    const [price, setPrice] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<ProductType>('ITEM');
    
    // [수정] 변수명 명확화: 상단 갤러리에 노출될 이미지들
    const [galleryImages, setGalleryImages] = useState<UploadedImage[]>([]);

    // 1. [에디터용] 본문 이미지 업로드 (툴바 버튼)
    const handleEditorUpload = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) return crossPlatformAlert("권한 필요", "사진첩 접근 권한이 필요합니다.");

        const pickerResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
        });

        if (pickerResult.canceled) return;

        const asset = pickerResult.assets[0];
        const formData = new FormData();
        const file = {
            uri: asset.uri,
            name: asset.fileName || 'image.jpg',
            type: asset.type ? `image/${asset.type}` : 'image/jpeg',
        };
        formData.append('files', file as any);

        try {
            const response = await apiClientWithFile.post<UploadedImage[]>('/api/images/upload', formData);
            if (response.data && response.data.length > 0) {
                const uploadedImage = response.data[0];
                const imageUrl = uploadedImage.imageUrl || uploadedImage.url;
                
                // [핵심] 갤러리 리스트에 추가하지 않고, 에디터 본문에 바로 삽입
                editorRef.current?.insertImage(imageUrl);
            }
        } catch (error) {
            console.error("에디터 이미지 업로드 실패:", error);
            crossPlatformAlert("오류", "이미지 업로드에 실패했습니다.");
        }
    };

    // 2. [갤러리용] 상품 대표 이미지 업로드 (하단 버튼)
    const handleGalleryUpload = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) return crossPlatformAlert("권한 필요", "사진첩 접근 권한이 필요합니다.");

        const pickerResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
        });

        if (pickerResult.canceled) return;

        const asset = pickerResult.assets[0];
        const formData = new FormData();
        const file = {
            uri: asset.uri,
            name: asset.fileName || 'image.jpg',
            type: asset.type ? `image/${asset.type}` : 'image/jpeg',
        };
        formData.append('files', file as any);

        try {
            const response = await apiClientWithFile.post<UploadedImage[]>('/api/images/upload', formData);
            if (response.data && response.data.length > 0) {
                const uploadedImage = response.data[0];
                
                // [핵심] 에디터에 넣지 않고, 갤러리 상태(State)에만 추가
                setGalleryImages(prev => [...prev, uploadedImage]);
            }
        } catch (error) {
            console.error("갤러리 이미지 업로드 실패:", error);
            crossPlatformAlert("오류", "이미지 업로드에 실패했습니다.");
        }
    };

    // 이미지 삭제 핸들러 (갤러리용)
    const handleRemoveImage = (imageIdToRemove: number) => {
        setGalleryImages(prev => prev.filter(img => img.imageId !== imageIdToRemove));
    };

    const handleSubmit = async () => {
        if (!productName.trim()) return crossPlatformAlert('', '상품명을 입력해주세요.');
        const priceNum = parseInt(price, 10);
        if (isNaN(priceNum) || priceNum < 0) return crossPlatformAlert('', '유효한 가격을 입력해주세요.');
        const amountNum = parseInt(amount, 10);
        if (isNaN(amountNum) || amountNum < 0) return crossPlatformAlert('', '유효한 수량을 입력해주세요.');
        
        const description = await editorRef.current?.getContentHtml() || '';
        if (!description.trim() || description === '<br/>') return crossPlatformAlert('', '상품 설명을 입력해주세요.');

        const productData = {
            productName,
            price: priceNum,
            amount: amountNum,
            type,
            description, // 본문 이미지는 여기에 HTML 태그로 포함됨 (백엔드가 자동 파싱)
            imageIds: galleryImages.map(img => img.imageId), // 갤러리 이미지 ID만 전송
        }

        try {
            await apiClient.post('api/products/create', productData);
            crossPlatformAlert('', '상품 정상 등록');
            router.back();
        } catch (error) {
            console.error('상품 등록 실패: ', error);
            crossPlatformAlert('', '상품 등록을 다시 시도해주세요.');
        }
    };

    return (
        <ScrollView style={styles.container}>
            {/* ... 기존 입력 폼 (상품명, 가격, 수량, 타입) ... */}
            <View style={styles.formGroup}>
                <Text style={styles.label}>상품명</Text>
                <TextInput style={styles.input} placeholder="상품명" value={productName} onChangeText={setProductName} />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>가격</Text>
                <TextInput style={styles.input} placeholder="가격" value={price} onChangeText={setPrice} keyboardType="numeric" />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>수량</Text>
                <TextInput style={styles.input} placeholder="수량" value={amount} onChangeText={setAmount} keyboardType="numeric" />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>상품 타입</Text>
                <View style={styles.pickerContainer}>
                    <Picker selectedValue={type} onValueChange={setType}>
                        <Picker.Item label="물건" value="ITEM" />
                        <Picker.Item label="구독권" value="SUBSCRIPTION" />
                    </Picker>
                </View>
            </View>

            {/* 상세 설명 에디터 영역 */}
            <View style={styles.formGroup}>
                <Text style={styles.label}>상세 설명 (본문 이미지)</Text>
                <RichToolbar
                    editor={editorRef}
                    actions={[
                        actions.setBold, actions.setItalic, actions.setUnderline,
                        actions.insertBulletsList, actions.insertOrderedList,
                        'customAddImage', // 커스텀 액션 아이디
                    ]}
                    iconMap={{
                        customAddImage: () => <Ionicons name="image-outline" size={24} color="#495057" />
                    }}
                    // [연결] 툴바 버튼 -> 에디터 삽입용 핸들러 호출
                    onPressAddImage={handleEditorUpload}
                />
                <RichEditor
                    ref={editorRef}
                    placeholder="상품 상세 설명을 입력해주세요..."
                    style={styles.editor}
                />
            </View>

            {/* 상품 대표 이미지(갤러리) 영역 */}
            <View style={styles.attachmentContainer}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10}}>
                    <Text style={styles.label}>상품 대표 이미지 (갤러리용: {galleryImages.length})</Text>
                    
                    {/* [연결] 추가 버튼 -> 갤러리 추가용 핸들러 호출 */}
                    <TouchableOpacity onPress={handleGalleryUpload}>
                        <Text style={{color: '#007bff', fontWeight: 'bold'}}>+ 이미지 추가</Text>
                    </TouchableOpacity>
                </View>
                
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {galleryImages.map((img) => (
                        <View key={img.imageId} style={styles.thumbnailWrapper}>
                            <Image source={{ uri: img.imageUrl || img.url }} style={styles.thumbnail} />
                            <TouchableOpacity
                                style={styles.removeButton}
                                onPress={() => handleRemoveImage(img.imageId)}
                            >
                                <Ionicons name="close" size={12} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>상품 등록</Text>
            </TouchableOpacity>
            
            <View style={{height: 50}} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', padding: 20 },
    formGroup: { marginBottom: 20 },
    label: { fontSize: 12, fontWeight: 'bold', marginBottom: 8, color: '#495057' },
    input: { borderWidth: 1, borderColor: '#dee2e6', padding: 12, fontSize: 16, borderRadius: 4 },
    pickerContainer: { borderWidth: 1, borderColor: '#dee2e6', borderRadius: 4 },
    editor: { minHeight: 200, borderWidth: 1, borderColor: '#dee2e6' },
    submitButton: { backgroundColor: '#007bff', padding: 15, borderRadius: 5, alignItems: 'center', marginTop: 16 },
    submitButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    attachmentContainer: { marginBottom: 20 },
    thumbnailWrapper: { width: 80, height: 80, marginRight: 10, position: 'relative', borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#eee' },
    thumbnail: { width: '100%', height: '100%' },
    removeButton: { position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
});

export default AddProductNative;
