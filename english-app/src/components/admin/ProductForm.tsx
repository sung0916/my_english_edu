import React, { useState, useRef, useEffect } from 'react';
import { Editor } from '@toast-ui/react-editor';
import '@toast-ui/editor/dist/toastui-editor.css';
import apiClient from "@/api"; // 상황에 맞는 axios 인스턴스 import
import { crossPlatformAlert } from "@/utils/crossPlatformAlert";
import { ProductType, LicensePeriod, PERIOD_LABELS } from '@/types/product';

export interface UploadedImage {
    imageId: number;
    url: string;
    imageUrl: string;
}

export interface ProductFormData {
    id?: number;
    productName: string;
    price: number;
    amount: number;
    type: ProductType;
    licensePeriod?: LicensePeriod;
    description: string;
    galleryImages: UploadedImage[];
}

// [수정] 단건 또는 다건(배열) 처리를 위해 타입 변경
interface ProductFormProps {
    initialData?: ProductFormData;
    onSubmit: (data: ProductFormData | ProductFormData[]) => Promise<void>; 
    submitButtonText: string;
}

// 구독권 가격 설정용 상태 타입
type SubscriptionPriceMap = {
    [key in LicensePeriod]?: {
        enabled: boolean;
        price: string;
    };
};

const ALL_PERIODS: LicensePeriod[] = ['ONEMONTH', 'THREEMONTH', 'SIXMONTH', 'ONEYEAR'];

export default function ProductForm({ initialData, onSubmit, submitButtonText }: ProductFormProps) {
    const editorRef = useRef<Editor>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 공통 상태
    const [productName, setProductName] = useState('');
    const [type, setType] = useState<ProductType>('ITEM');
    const [description, setDescription] = useState('');
    const [galleryImages, setGalleryImages] = useState<UploadedImage[]>([]);

    // ITEM(일반상품) 전용 상태
    const [itemPrice, setItemPrice] = useState('');
    const [itemAmount, setItemAmount] = useState('');

    // SUBSCRIPTION(구독권) 전용 상태 - [핵심 변경]
    const [subPrices, setSubPrices] = useState<SubscriptionPriceMap>({
        ONEMONTH: { enabled: true, price: '' },
        THREEMONTH: { enabled: false, price: '' },
        SIXMONTH: { enabled: false, price: '' },
        ONEYEAR: { enabled: false, price: '' },
        // NONE: { enabled: false, price: '' },
    });

    // 초기 데이터 로드
    useEffect(() => {
        if (initialData) {
            setProductName(initialData.productName);
            setType(initialData.type);
            setGalleryImages(initialData.galleryImages);
            setDescription(initialData.description); 
            
            if (initialData.type === 'ITEM') {
                setItemPrice(String(initialData.price));
                setItemAmount(String(initialData.amount));
            } else {
                // 수정 모드일 때는 해당 기간만 활성화
                if (initialData.licensePeriod) {
                    setSubPrices(prev => ({
                        ...prev,
                        [initialData.licensePeriod!]: { enabled: true, price: String(initialData.price) }
                    }));
                }
            }
        }
    }, [initialData]);

    // 이미지 업로드 로직 (기존 유지)
    const handleGalleryFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('files', file);

        try {
            const response = await apiClient.post<UploadedImage[]>('/api/images/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (response.data && response.data.length > 0) {
                setGalleryImages(prev => [...prev, response.data[0]]);
            }
        } catch (err) {
            console.error(err);
            crossPlatformAlert('Failed to upload images', '');
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const onEditorAddImageBlob = async (blob: Blob | File, callback: (url: string, altText: string) => void) => {
         const formData = new FormData();
        formData.append('files', blob);
        try {
            const response = await apiClient.post<UploadedImage[]>('/api/images/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (response.data && response.data.length > 0) {
                const imageUrl = response.data[0].imageUrl || response.data[0].url;
                callback(imageUrl, 'image');
            }
        } catch (error) {
            console.error(error);
            crossPlatformAlert('Failed to upload images', '');
        }
    };

    const handleRemoveImage = (imageId: number) => {
        setGalleryImages(prev => prev.filter(img => img.imageId !== imageId));
    };

    // [추가] 구독권 가격 입력 핸들러
    const handleSubPriceChange = (period: LicensePeriod, field: 'enabled' | 'price', value: any) => {
        setSubPrices(prev => ({
            ...prev,
            [period]: { ...prev[period], [field]: value }
        }));
    };

    const handleSubmit = () => {
        if (!productName.trim()) return crossPlatformAlert('', 'Please enter product name');
        const descContent = editorRef.current?.getInstance().getHTML();
        if (!descContent || descContent === '<p><br></p>') return crossPlatformAlert('', 'Please enter product detail');

        // 1. 일반 상품 (ITEM)
        if (type === 'ITEM') {
            const priceNum = parseInt(itemPrice, 10);
            const amountNum = parseInt(itemAmount, 10);
            if (isNaN(priceNum) || priceNum < 0) return crossPlatformAlert('', 'Check the price form');
            if (isNaN(amountNum) || amountNum < 0) return crossPlatformAlert('', 'Check the amount form');

            onSubmit({
                id: initialData?.id,
                productName,
                price: priceNum,
                amount: amountNum,
                type: 'ITEM',
                licensePeriod: undefined,
                description: descContent,
                galleryImages
            });
        } 
        // 2. 구독권 (SUBSCRIPTION) - 다건 생성 로직
        else {
            const productsToCreate: ProductFormData[] = [];

            ALL_PERIODS.forEach(period => {
                const setting = subPrices[period];
                if (setting?.enabled) {
                    const priceNum = parseInt(setting.price, 10);
                    if (!isNaN(priceNum) && priceNum >= 0) {
                        productsToCreate.push({
                            productName,
                            price: priceNum,
                            amount: 9999, // 구독권은 수량 무제한
                            type: 'SUBSCRIPTION',
                            licensePeriod: period,
                            description: descContent,
                            galleryImages
                        });
                    }
                }
            });

            if (productsToCreate.length === 0) {
                return crossPlatformAlert('', 'Please set at least one period and price');
            }

            // 배열 전달
            onSubmit(productsToCreate);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.formSection}>
                <div style={styles.rowContainer}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Product Name</label>
                        <input style={styles.input} placeholder="Enter name" value={productName} onChange={(e) => setProductName(e.target.value)} />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Category</label>
                        <select style={styles.input} value={type} onChange={(e) => setType(e.target.value as ProductType)}>
                            <option value="ITEM">Goods</option>
                            <option value="SUBSCRIPTION">Plan</option>
                        </select>
                    </div>
                </div>

                {/* 타입에 따른 UI 분기 */}
                {type === 'ITEM' ? (
                    <div style={styles.rowContainer}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>price</label>
                            <input style={styles.input} type="number" placeholder="Enter price" value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Quantity</label>
                            <input style={styles.input} type="number" placeholder="Enter quantity" value={itemAmount} onChange={(e) => setItemAmount(e.target.value)} />
                        </div>
                    </div>
                ) : (
                    // [수정] 구독권일 때: 체크박스 리스트 표시
                    <div style={{ marginTop: '10px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px', border: '1px solid #dee2e6' }}>
                        <label style={styles.label}>Pricing by usage period</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                            {ALL_PERIODS.map((period) => (
                                <div key={period} style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#fff', padding: '10px', borderRadius: '4px', border: '1px solid #eee' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={subPrices[period]?.enabled || false}
                                        onChange={(e) => handleSubPriceChange(period, 'enabled', e.target.checked)}
                                        style={{ width: '18px', height: '18px' }}
                                    />
                                    <span style={{ width: '80px', fontSize: '14px', fontWeight: 'bold' }}>{PERIOD_LABELS[period]}</span>
                                    <input 
                                        type="number"
                                        placeholder="Enter price"
                                        value={subPrices[period]?.price || ''}
                                        onChange={(e) => handleSubPriceChange(period, 'price', e.target.value)}
                                        disabled={!subPrices[period]?.enabled}
                                        style={{ ...styles.input, flex: 1, backgroundColor: !subPrices[period]?.enabled ? '#f1f3f5' : '#fff' }}
                                    />
                                    <span style={{ fontSize: '14px' }}> ₩</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* 에디터 */}
            <div style={styles.editorSection}>
                <label style={styles.label}>Product detail</label>
                <div style={styles.editorWrapper}>
                    <Editor
                        ref={editorRef}
                        initialValue={initialData?.description || ' '} 
                        placeholder="Enter the details"
                        previewStyle="vertical"
                        height="500px"
                        initialEditType="wysiwyg"
                        hooks={{ addImageBlobHook: onEditorAddImageBlob }}
                    />
                </div>
            </div>

            {/* 갤러리 */}
            <div style={styles.attachmentSection}>
                <div style={styles.attachmentHeader}>
                    <label style={styles.label}>Thumbnail (total: {galleryImages.length})</label>
                    <button style={styles.uploadButton} onClick={() => fileInputRef.current?.click()}>+ add image</button>
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
                <button style={styles.submitButton} onClick={handleSubmit}>{submitButtonText}</button>
            </div>
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    container: { display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#fff', padding: '20px', boxSizing: 'border-box', border: '1px solid #dee2e6', borderRadius: '8px', overflowY: 'auto' },
    formSection: { display: 'flex', flexDirection: 'column', gap: '15px' },
    rowContainer: { display: 'flex', flexDirection: 'row', gap: '20px' },
    formGroup: { flex: 1 },
    editorSection: { /*flexGrow: 1,*/ display: 'flex', flexDirection: 'column', marginTop: '20px', minHeight: '300px' },
    editorWrapper: { /*flexGrow: 1,*/ border: '1px solid #dee2e6', borderRadius: '4px', overflow: 'hidden' },
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
