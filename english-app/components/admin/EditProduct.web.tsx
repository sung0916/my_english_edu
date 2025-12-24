import apiClient, { apiClientWithFile } from "@/api";
import { crossPlatformAlert } from "@/utils/crossPlatformAlert";
import { Editor } from "@toast-ui/react-editor";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";

// 타입 정의
type ProductType = 'SUBSCRIPTION' | 'ITEM';

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

interface UploadedImage {
    imageId: number;
    url: string;
    imageUrl: string;
}

const EditProductWeb = () => {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const editorRef = useRef<Editor>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const [description, setDescription] = useState('');
    const [productName, setProductName] = useState('');
    const [price, setPrice] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<ProductType>('ITEM');
    
    // [수정] 갤러리 이미지 상태 (UploadedImage 배열)
    const [galleryImages, setGalleryImages] = useState<UploadedImage[]>([]);

    // 데이터 불러오기
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
                    setDescription(data.description);
                    
                    // [핵심] 기존 갤러리 이미지 매핑
                    const mappedImages: UploadedImage[] = data.images.map(img => ({
                        imageId: img.id,
                        imageUrl: img.imageUrl,
                        url: img.imageUrl
                    }));
                    setGalleryImages(mappedImages);

                } catch (error) {
                    console.error("로딩 실패:", error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchProductData();
        }
    }, [id]);

    // 1. [갤러리용] 파일 선택 핸들러
    const handleGalleryFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('files', file);

        try {
            const response = await apiClientWithFile.post<UploadedImage[]>('/api/images/upload', formData);
            if (response.data && response.data.length > 0) {
                // [핵심] 갤러리 상태에 추가
                setGalleryImages(prev => [...prev, response.data[0]]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // 2. [에디터용] 훅
    const onEditorAddImageBlob = async (blob: Blob | File, callback: (url: string, altText: string) => void) => {
        const formData = new FormData();
        formData.append('files', blob);

        try {
            const response = await apiClientWithFile.post<UploadedImage[]>('/api/images/upload', formData);
            if (response.data && response.data.length > 0) {
                const imageUrl = response.data[0].imageUrl || response.data[0].url;
                // [핵심] 에디터에 삽입만 (상태 추가 X)
                callback(imageUrl, 'image');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleRemoveImage = (imageId: number) => {
        setGalleryImages(prev => prev.filter(img => img.imageId !== imageId));
    };

    const handleSubmit = async () => {
        // ... 유효성 검사 ... (생략)

        const productData = {
            id: Number(id),
            productName,
            price: parseInt(price),
            amount: parseInt(amount),
            type,
            description: editorRef.current?.getInstance().getHTML(),
            imageIds: galleryImages.map(img => img.imageId), // 갤러리 ID만 전송
        };

        try {
            await apiClient.post('/api/products/edit', productData);
            crossPlatformAlert('성공', '수정 완료');
            router.back();
        } catch (error) {
            console.error('수정 실패:', error);
            crossPlatformAlert('오류', '수정 실패');
        }
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <div style={styles.pageWrapper}>
            <div style={styles.container}>
                {/* ... 기본 입력 폼들 ... */}
                <div style={styles.formSection}>
                    {/* (AddProductWeb과 동일한 구조의 입력 필드들) */}
                     <div style={styles.rowContainer}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>상품명</label>
                            <input style={styles.input} value={productName} onChange={(e) => setProductName(e.target.value)} />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>상품 타입</label>
                            <select style={styles.input} value={type} onChange={(e) => setType(e.target.value as ProductType)}>
                                <option value="ITEM">물건</option>
                                <option value="SUBSCRIPTION">구독권</option>
                            </select>
                        </div>
                    </div>
                     <div style={styles.rowContainer}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>가격</label>
                            <input style={styles.input} type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>수량</label>
                            <input style={styles.input} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
                        </div>
                    </div>
                </div>

                {/* 에디터 섹션 */}
                <div style={styles.editorSection}>
                    <label style={styles.label}>상세 설명</label>
                    <div style={styles.editorWrapper}>
                        <Editor
                            ref={editorRef}
                            initialValue={description}
                            placeholder="설명 입력"
                            previewStyle="vertical"
                            height="100%"
                            initialEditType="wysiwyg"
                            hooks={{ addImageBlobHook: onEditorAddImageBlob }}
                            toolbarItems={[
                                ['heading', 'bold', 'italic', 'strike'],
                                ['hr', 'quote'],
                                ['ul', 'ol', 'task', 'indent', 'outdent'],
                                ['table', 'image', 'link'],
                                ['code', 'codeblock']
                            ]}
                        />
                    </div>
                </div>

                {/* 갤러리 섹션 */}
                <div style={styles.attachmentSection}>
                    <div style={styles.attachmentHeader}>
                        <label style={styles.label}>상품 대표 이미지 (갤러리: {galleryImages.length})</label>
                        <button style={styles.uploadButton} onClick={() => fileInputRef.current?.click()}>
                            + 이미지 추가
                        </button>
                        <input type="file" ref={fileInputRef} style={{display:'none'}} accept="image/*" onChange={handleGalleryFileChange} />
                    </div>
                    <div style={styles.thumbnailList}>
                        {galleryImages.map((img) => (
                            <div key={img.imageId} style={styles.thumbnailWrapper}>
                                <img src={img.imageUrl} alt="thumb" style={styles.thumbnail} />
                                <button style={styles.removeButton} onClick={() => handleRemoveImage(img.imageId)}>✕</button>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={styles.buttonSection}>
                    <button style={styles.submitButton} onClick={handleSubmit}>상품 수정</button>
                </div>
            </div>
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    // ... (AddProductWeb과 동일한 스타일)
    pageWrapper: { height: 'calc(100vh - 80px)', padding: '20px', boxSizing: 'border-box', backgroundColor: '#f8f9fa' },
    container: { display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#fff', padding: '20px', boxSizing: 'border-box', border: '1px solid #dee2e6', borderRadius: '8px', overflowY: 'auto' },
    formSection: { display: 'flex', flexDirection: 'column', gap: '15px' },
    rowContainer: { display: 'flex', flexDirection: 'row', gap: '20px' },
    formGroup: { flex: 1 },
    editorSection: { flexGrow: 1, display: 'flex', flexDirection: 'column', marginTop: '20px', minHeight: '300px' },
    editorWrapper: { flexGrow: 1, border: '1px solid #dee2e6', borderRadius: '4px', overflow: 'hidden' },
    buttonSection: { marginTop: '10px', textAlign: 'right' },
    label: { fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: '#495057', display: 'block' },
    input: { width: '100%', border: '1px solid #dee2e6', padding: '12px', fontSize: '16px', borderRadius: '4px', boxSizing: 'border-box' },
    submitButton: { backgroundColor: '#007bff', color: 'white', padding: '15px 30px', borderRadius: '5px', fontSize: '14px', fontWeight: 'bold', border: 'none', cursor: 'pointer' },
    attachmentSection: { marginTop: '20px' },
    attachmentHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
    uploadButton: { padding: '5px 10px', fontSize: '12px', cursor: 'pointer', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px' },
    thumbnailList: { display: 'flex', flexWrap: 'wrap', gap: '10px' },
    thumbnailWrapper: { width: '80px', height: '80px', position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid #dee2e6' },
    thumbnail: { width: '100%', height: '100%', objectFit: 'cover' },
    removeButton: { position: 'absolute', top: '2px', right: '2px', backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' },
};

export default EditProductWeb;
