import apiClient, { apiClientWithFile } from "@/api";
import { crossPlatformAlert } from "@/utils/crossPlatformAlert";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
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
    imageId: number;
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
    const [galleryImages, setGalleryImages] = useState<UploadedImage[]>([]);
    const [initialContent, setInitialContent] = useState('');

    // 1. [에디터용] 본문 이미지 업로드 (상태 추가 X)
    const handleEditorUpload = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) return crossPlatformAlert("권한 필요", "권한이 필요합니다.");

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

                // [핵심] 에디터에 삽입만 함 (갤러리 추가 X)
                editorRef.current?.insertImage(imageUrl);
            }
        } catch (error) {
            console.error("에디터 업로드 실패:", error);
        }
    };

    // 2. [갤러리용] 상품 대표 이미지 업로드 (상태 추가 O)
    const handleGalleryUpload = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) return crossPlatformAlert("권한 필요", "권한이 필요합니다.");

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
                // [핵심] 갤러리 상태에 추가
                setGalleryImages(prev => [...prev, uploadedImage]);
            }
        } catch (error) {
            console.error("갤러리 업로드 실패:", error);
        }
    };

    const handleRemoveImage = (imageId: number) => {
        setGalleryImages(prev => prev.filter(img => img.imageId !== imageId));
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

                    const mappedImages: UploadedImage[] = data.images.map(img => ({
                        imageId: img.id,
                        imageUrl: img.imageUrl,
                        url: img.imageUrl
                    }));
                    setGalleryImages(mappedImages);

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
            imageIds: galleryImages.map(img => img.imageId),
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
                        customAddImage: () => <Ionicons name="image-outline" size={24} color="#495057" />
                    }}
                    onPressAddImage={handleEditorUpload}
                />
                <RichEditor
                    ref={editorRef}
                    initialContentHTML={initialContent}
                    style={styles.editor}
                />
            </View>

            <View style={styles.attachmentContainer}>
                <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom:10}}>
                    <Text style={styles.label}>상품 대표 이미지 (갤러리)</Text>
                    <TouchableOpacity onPress={handleGalleryUpload}>
                        <Text style={{color:'#007bff'}}>+ 이미지 추가</Text>
                    </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {galleryImages.map((img) => (
                        <View key={img.imageId} style={styles.thumbnailWrapper}>
                            <Image source={{ uri: img.imageUrl }} style={styles.thumbnail} />
                            <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveImage(img.imageId)}>
                                <Ionicons name="close" size={12} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>
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
    attachmentContainer: { marginBottom: 20 },
    thumbnailWrapper: { width: 80, height: 80, marginRight: 10, borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#eee' },
    thumbnail: { width: '100%', height: '100%' },
    removeButton: { position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
});

export default EditProductNative;
