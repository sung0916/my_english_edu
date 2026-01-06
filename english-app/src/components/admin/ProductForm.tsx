import '@toast-ui/editor/dist/toastui-editor.css'; 
import '@toast-ui/editor/toastui-editor.css';
import React, { useRef, useState, useEffect } from "react";
import { Editor } from "@toast-ui/react-editor";
import { apiClientWithFile } from "@/api";
import { crossPlatformAlert } from "@/utils/crossPlatformAlert";

export type ProductType = 'SUBSCRIPTION' | 'ITEM';

export interface UploadedImage {
    imageId: number;
    url: string;
    imageUrl: string;
}

// 폼 데이터 타입 정의
export interface ProductFormData {
    id?: number;
    productName: string;
    price: number;
    amount: number;
    type: ProductType;
    description: string;
    galleryImages: UploadedImage[];
}

interface ProductFormProps {
    initialData?: ProductFormData; // 수정 시 초기 데이터
    onSubmit: (data: ProductFormData) => Promise<void>; // 부모가 처리할 제출 함수
    submitButtonText: string;
}

export default function ProductForm({ initialData, onSubmit, submitButtonText }: ProductFormProps) {
    const editorRef = useRef<Editor>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 상태 관리
    const [productName, setProductName] = useState('');
    const [price, setPrice] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<ProductType>('ITEM');
    const [galleryImages, setGalleryImages] = useState<UploadedImage[]>([]);

    // 초기 데이터가 있으면 세팅 (수정 모드)
    useEffect(() => {
        if (initialData) {
            setProductName(initialData.productName);
            setPrice(String(initialData.price));
            setAmount(String(initialData.amount));
            setType(initialData.type);
            setGalleryImages(initialData.galleryImages);
            // Editor는 initialValue prop으로 처리하므로 여기서 state 설정 불필요
        }
    }, [initialData]);

    // 1. 갤러리 이미지 업로드
    const handleGalleryFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('files', file);

        try {
            const response = await apiClientWithFile.post<UploadedImage[]>('/api/images/upload', formData);
            if (response.data && response.data.length > 0) {
                setGalleryImages(prev => [...prev, response.data[0]]);
            }
        } catch (err) {
            console.error(err);
            crossPlatformAlert('오류', '이미지 업로드 실패');
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // 2. 에디터 이미지 업로드 훅
    const onEditorAddImageBlob = async (blob: Blob | File, callback: (url: string, altText: string) => void) => {
        const formData = new FormData();
        formData.append('files', blob);

        try {
            const response = await apiClientWithFile.post<UploadedImage[]>('/api/images/upload', formData);
            if (response.data && response.data.length > 0) {
                const imageUrl = response.data[0].imageUrl || response.data[0].url;
                callback(imageUrl, 'image');
            }
        } catch (error) {
            console.error(error);
            crossPlatformAlert('오류', '에디터 이미지 업로드 실패');
        }
    };

    const handleRemoveImage = (imageId: number) => {
        setGalleryImages(prev => prev.filter(img => img.imageId !== imageId));
    };

    const handleSubmit = () => {
        if (!productName.trim()) return crossPlatformAlert('', '상품명을 입력해주세요.');
        const priceNum = parseInt(price, 10);
        if (isNaN(priceNum) || priceNum < 0) return crossPlatformAlert('', '유효한 가격을 입력해주세요.');
        const amountNum = parseInt(amount, 10);
        if (isNaN(amountNum) || amountNum < 0) return crossPlatformAlert('', '유효한 수량을 입력해주세요.');
        
        const description = editorRef.current?.getInstance().getHTML();
        if (!description || !description.trim() || description === '<p><br></p>') {
            return crossPlatformAlert('', "상품 상세 설명을 입력해주세요.");
        }

        // 데이터 정제 후 부모에게 전달
        onSubmit({
            id: initialData?.id,
            productName,
            price: priceNum,
            amount: amountNum,
            type,
            description,
            galleryImages
        });
    };

    return (
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

            {/* 에디터 */}
            <div style={styles.editorSection}>
                <label style={styles.label}>상세 설명</label>
                <div style={styles.editorWrapper}>
                    <Editor
                        ref={editorRef}
                        initialValue={initialData?.description || ' '} // 초기값 설정 중요
                        placeholder="상품 상세 설명을 입력하세요."
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

            {/* 갤러리 이미지 */}
            <div style={styles.attachmentSection}>
                <div style={styles.attachmentHeader}>
                    <label style={styles.label}>상품 대표 이미지 (갤러리용: {galleryImages.length})</label>
                    <button style={styles.uploadButton} onClick={() => fileInputRef.current?.click()}>
                        + 이미지 추가
                    </button>
                    <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleGalleryFileChange} />
                </div>

                <div style={styles.thumbnailList}>
                    {galleryImages.map((img) => (
                        <div key={img.imageId} style={styles.thumbnailWrapper}>
                            <img src={img.imageUrl || img.url} alt="thumb" style={styles.thumbnail} />
                            <button style={styles.removeButton} onClick={() => handleRemoveImage(img.imageId)}>✕</button>
                        </div>
                    ))}
                </div>
            </div>

            <div style={styles.buttonSection}>
                <button style={styles.submitButton} onClick={handleSubmit}>
                    {submitButtonText}
                </button>
            </div>
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
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
