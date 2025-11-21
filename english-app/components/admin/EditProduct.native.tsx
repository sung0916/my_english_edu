import apiClient, { API_BASE_URL, apiClientWithFile } from "@/api";
import { crossPlatformAlert } from "@/utils/crossPlatformAlert";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { actions, RichEditor, RichToolbar } from "react-native-pell-rich-editor";

interface ImageDetail {
    id: number;
    imageUrl: string;
}

interface ProductDetail {
    id: number;
    productName: string;
    price: number;
    amount: number;
    description: string;
    type: ProductType;
    images: ImageDetail[];
}

type ProductType = 'SUBSCRIPTION' | 'ITEM';

interface UploadedImage {
    id: number;
    url: string; // 에디터에 삽입될 URL
    imageUrl: string; // imageUrl 필드가 있다면 그것을 사용
}

const EditProductNative = () => {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const editorRef = useRef<RichEditor>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [productName, setProductName] = useState('');
    const [price, setPrice] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<ProductType>('ITEM');
    const [uploadedImageIds, setUploadedImageIds] = useState<number[]>([]);
    const [initialContent, setInitialContent] = useState('');

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
                const fullImageUrl = `${API_BASE_URL}/${imageUrlToInsert}`;
                editorRef.current?.insertImage(fullImageUrl);

                // 업로드 성공 시, 반환된 이미지 ID를 상태에 추가
                setUploadedImageIds(prevIds => [...prevIds, uploadedImage.id]);
            }
        } catch (error) {
            console.error("이미지 업로드 실패:", error);
            crossPlatformAlert("오류", "이미지 업로드에 실패했습니다.");
        }
    };

    // 상품 데이터 가져오는 로직
    useEffect(() => {
        if (id) {
            const fetchProductData = async () => {
                try {
                    const response = await apiClient.get<ProductDetail>(`/api/products/${id}`);
                    const data = response.data;
                    setProductName(data.productName);
                    setPrice(String(data.price));
                    setAmount(String(data.amount));
                    setType(data.type);
                    const styledDescription = `
                        <style>img {max-width: 100%; height: auto;}</style>
                        ${data.description}
                    `;
                    setInitialContent(styledDescription);  // 타이밍 문제 해결
                    const existingImageIds = data.images.map(img => img.id);
                    setUploadedImageIds(existingImageIds);
                    
                } catch (error) {
                    console.error('상품 정보 로딩 실패: ', error);
                    crossPlatformAlert('', '상품 정보를 불러오는 데 실패함');

                } finally {
                    setIsLoading(false);
                }
            };
            fetchProductData();
        }
    }, [id]);

    const handleSubmit = async () => {
        // 입력값 유효성 검사
        if (!productName.trim()) {
            crossPlatformAlert('', '상품명을 입력해주세요.');
            return;
        }
        const priceNum = parseInt(price, 10);
        if (isNaN(priceNum) || priceNum < 0) {
            crossPlatformAlert('', '유효한 가격을 입력해주세요.');
            return;
        }
        const amountNum = parseInt(amount, 10);
        if (isNaN(amountNum) || amountNum < 0) {
            crossPlatformAlert('', '유효한 수량을 입력해주세요.');
            return;
        }
        const description = await editorRef.current?.getContentHtml() || '';
        if (!description.trim() || description === '<br/>') {
            crossPlatformAlert('', '상품 설명을 입력해주세요.');
        }

        // API 요청 데이터 준비
        const productData = {
            id: Number(id),
            productName,
            price: parseInt(price, 10),
            amount: parseInt(amount, 10),
            type,
            description,
        }

        // API 요청
        try {
            await apiClient.post('api/products/edit', productData);
            crossPlatformAlert('', '상품 정상 등록');
            router.back();
        } catch (error) {
            console.error('상품 등록 실패: ', error);
            crossPlatformAlert('', '상품 등록을 다시 시도해주세요.');
        }
    };

    if (isLoading) {
        return <ActivityIndicator size="large" style={{ flex: 1 }} />;
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.formGroup}>
                <Text style={styles.label}>상품명</Text>
                <TextInput
                    style={styles.input}
                    value={productName}
                    onChangeText={setProductName}
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>가격</Text>
                <TextInput 
                    style={styles.input}
                    placeholder="가격을 입력하세요"
                    value={price}
                    onChangeText={setPrice}
                    keyboardType="numeric"
                />
            </View>
            <View style={styles.formGroup}>
                <Text style={styles.label}>수량</Text>
                <TextInput
                    style={styles.input}
                    placeholder="수량을 입력하세요"
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="numeric" 
                />
            </View>
            <View style={styles.formGroup}>
                <Text style={styles.label}>상품 타입</Text>
                <Picker 
                    selectedValue={type}
                    onValueChange={(itemValue) => setType(itemValue)}
                >
                    <Picker.Item label="물건" value="ITEM" />
                    <Picker.Item label="구독권" value="SUBSCRIPTION" />
                </Picker>
            </View>
            
            <View style={styles.formGroup}>
                <Text style={styles.label}>상세 설명</Text>
                <RichToolbar
                    editor={editorRef}
                    actions={[
                        actions.setBold, 
                        actions.setItalic, 
                        actions.setUnderline, 
                        actions.insertBulletsList, 
                        actions.insertOrderedList, 
                        actions.insertImage,
                        'insertImage'
                    ]}
                    iconMap={{ 
                        insertImage: () => <Ionicons name="image-outline" size={24} color="#495057" />
                    }}
                    onPressAddImage={handleImageUpload}
                />
                <RichEditor
                    ref={editorRef}
                    initialContentHTML={initialContent} 
                    style={styles.editor}
                />
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>상품 수정</Text>
            </TouchableOpacity>
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
});

export default EditProductNative;
