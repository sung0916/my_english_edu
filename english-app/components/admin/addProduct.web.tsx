import apiClient, { apiClientWithFile } from "@/api";
import { crossPlatformAlert } from "@/utils/crossPlatformAlert";
import '@toast-ui/editor/toastui-editor.css';
import { Editor } from "@toast-ui/react-editor";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";

type ProductType = 'SUBSCRIPTION' | 'ITEM';

interface UploadedImage {
    imageId: number;
    url: string;
    imageUrl: string;
}

const AddProductWeb = () => {
    const router = useRouter();
    const editorRef = useRef<Editor>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [productName, setProductName] = useState('');
    const [price, setPrice] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<ProductType>('ITEM');
    
    // [수정] 변수명 명확화
    const [galleryImages, setGalleryImages] = useState<UploadedImage[]>([]);

    // 1. [갤러리용] 파일 선택 핸들러
    const handleFileButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleGalleryFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('files', file);

        try {
            const response = await apiClientWithFile.post<UploadedImage[]>('/api/images/upload', formData);

            if (response.data && response.data.length > 0) {
                const imageInfo = response.data[0];
                // [핵심] 갤러리 리스트에 추가
                setGalleryImages(prev => [...prev, imageInfo]);
            }
        } catch (err) {
            console.error(err);
            crossPlatformAlert('오류', '이미지 업로드 실패');
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // 2. [에디터용] Toast UI Editor 훅
    // 툴바의 이미지 아이콘을 클릭했을 때 실행되는 함수
    const onEditorAddImageBlob = async (blob: Blob | File, callback: (url: string, altText: string) => void) => {
        const formData = new FormData();
        formData.append('files', blob);

        try {
            const response = await apiClientWithFile.post<UploadedImage[]>('/api/images/upload', formData);

            if (response.data && response.data.length > 0) {
                const imageInfo = response.data[0];
                const imageUrl = imageInfo.imageUrl || imageInfo.url;
                
                // [핵심] 에디터에 이미지 삽입 (갤러리 리스트엔 추가 안 함)
                callback(imageUrl, 'image');
            }
        } catch (error) {
            console.error('에디터 이미지 업로드 실패:', error);
            crossPlatformAlert('오류', '본문 이미지 삽입 실패');
        }
    };

    const handleRemoveImage = (imageId: number) => {
        setGalleryImages(prev => prev.filter(img => img.imageId !== imageId));
    };

    const handleSubmit = async () => {
        if (!productName.trim()) return crossPlatformAlert('', '상품명을 입력해주세요.');
        const priceNum = parseInt(price, 10);
        if (isNaN(priceNum) || priceNum < 0) return crossPlatformAlert('', '유효한 가격을 입력해주세요.');
        const amountNum = parseInt(amount, 10);
        if (isNaN(amountNum) || amountNum < 0) return crossPlatformAlert('', '유효한 수량을 입력해주세요.');
        
        const description = editorRef.current?.getInstance().getHTML();
        if (!description || !description.trim() || description === '<p><br></p>') {
            return crossPlatformAlert('', "상품 상세 설명을 입력해주세요.");
        }

        const productData = {
            productName,
            price: priceNum,
            amount: amountNum,
            type,
            description, // 본문 이미지는 여기에 포함됨
            imageIds: galleryImages.map(img => img.imageId), // 갤러리 이미지 ID만 전송
        };

        try {
            await apiClient.post('/api/products/create', productData);
            crossPlatformAlert('성공', '상품이 성공적으로 등록되었습니다.');
            router.back();
        } catch (error) {
            console.error('상품 등록 실패:', error);
            crossPlatformAlert('오류', '상품 등록 중 오류가 발생했습니다.');
        }
    };

    return (
        <div style={styles.pageWrapper}>
            <div style={styles.container}>
                <div style={styles.formSection}>
                    <div style={styles.rowContainer}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>상품명</label>
                            <input style={styles.input} placeholder="상품명" value={productName} onChange={(e) => setProductName(e.target.value)} />
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
                            <input style={styles.input} type="number" placeholder="가격" value={price} onChange={(e) => setPrice(e.target.value)} />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>수량</label>
                            <input style={styles.input} type="number" placeholder="수량" value={amount} onChange={(e) => setAmount(e.target.value)} />
                        </div>
                    </div>
                </div>

                {/* 상세 설명 에디터 */}
                <div style={styles.editorSection}>
                    <label style={styles.label}>상세 설명 (본문 이미지)</label>
                    <div style={styles.editorWrapper}>
                        <Editor
                            ref={editorRef}
                            placeholder="상품 상세 설명을 입력하세요."
                            previewStyle="vertical"
                            height="100%"
                            initialEditType="wysiwyg"
                            // [핵심] hooks 설정: 툴바 이미지 버튼 동작 제어
                            hooks={{
                                addImageBlobHook: onEditorAddImageBlob
                            }}
                            toolbarItems={[
                                ['heading', 'bold', 'italic', 'strike'],
                                ['hr', 'quote'],
                                ['ul', 'ol', 'task', 'indent', 'outdent'],
                                ['table', 'image', 'link'], // image 버튼 포함
                                ['code', 'codeblock']
                            ]}
                        />
                    </div>
                </div>

                {/* 상품 대표 이미지 (갤러리) */}
                <div style={styles.attachmentSection}>
                    <div style={styles.attachmentHeader}>
                        <label style={styles.label}>상품 대표 이미지 (갤러리용: {galleryImages.length})</label>
                        <button style={styles.uploadButton} onClick={handleFileButtonClick}>
                            + 이미지 추가
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            accept="image/*"
                            onChange={handleGalleryFileChange}
                        />
                    </div>

                    <div style={styles.thumbnailList}>
                        {galleryImages.map((img) => (
                            <div key={img.imageId} style={styles.thumbnailWrapper}>
                                <img src={img.imageUrl || img.url} alt="thumb" style={styles.thumbnail} />
                                <button
                                    style={styles.removeButton}
                                    onClick={() => handleRemoveImage(img.imageId)}
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={styles.buttonSection}>
                    <button style={styles.submitButton} onClick={handleSubmit}>
                        상품 등록
                    </button>
                </div>
            </div>
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    // ... (이전과 동일한 스타일)
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

export default AddProductWeb;
