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
    const [productName, setProductName] = useState('');
    const [price, setPrice] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<ProductType>('ITEM');
    const [uploadedImageIds, setUploadedImageIds] = useState<number[]>([]);

    const handleSubmit = async () => {
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
        const description = editorRef.current?.getInstance().getHTML();
        if (!description || !description.trim() || description === '<p><br></p>') {
            crossPlatformAlert('', "상품 상세 설명을 입력해주세요.");
            return;
        }

        const productData = {
            productName,
            price: priceNum,
            amount: amountNum,
            type,
            description,
            imageIds: uploadedImageIds,
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
                {/* [수정] 폼 전체를 감싸는 섹션 */}
                <div style={styles.formSection}>
                    {/* 첫 번째 줄: 상품명, 상품 타입 */}
                    <div style={styles.rowContainer}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>상품명</label>
                            <input
                                style={styles.input}
                                placeholder="상품명을 입력하세요"
                                value={productName}
                                onChange={(e) => setProductName(e.target.value)}
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>상품 타입</label>
                            <select
                                style={styles.input}
                                value={type}
                                onChange={(e) => setType(e.target.value as ProductType)}
                            >
                                <option value="ITEM">물건</option>
                                <option value="SUBSCRIPTION">구독권</option>
                            </select>
                        </div>
                    </div>

                    {/* 두 번째 줄: 가격, 수량 */}
                    <div style={styles.rowContainer}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>가격</label>
                            <input
                                style={styles.input}
                                type="number"
                                placeholder="가격을 입력하세요"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>수량</label>
                            <input
                                style={styles.input}
                                type="number"
                                placeholder="수량을 입력하세요"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* 에디터 영역 */}
                <div style={styles.editorSection}>
                    <label style={styles.label}>상세 설명</label>
                    <div style={styles.editorWrapper}>
                        <Editor
                            ref={editorRef}
                            placeholder="상품 상세 설명을 입력하세요."
                            previewStyle="vertical"
                            height="100%"
                            initialEditType="wysiwyg"
                            hooks={{
                                addImageBlobHook: async (blob: File | Blob, callback: (url: string, altText: string) => void) => {
                                    const formData = new FormData();
                                    formData.append('files', blob);

                                    try {
                                        const response = await apiClientWithFile.post<UploadedImage[]>('/api/images/upload', formData);

                                        if (response.data && response.data.length > 0) {
                                            const imageInfo = response.data[0];
                                            const imageUrl = imageInfo.imageUrl || imageInfo.url;
                                            // const fullImageUrl = `${API_BASE_URL}/${imageUrl}`;
                                            const fullImageUrl = imageUrl;

                                            callback(fullImageUrl, 'image');

                                            // 업로드된 이미지 ID는 상태에 저장
                                            setUploadedImageIds(prevIds => [...prevIds, imageInfo.imageId]);
                                        }
                                    } catch (error) {
                                        console.error('이미지 업로드 실패: ', error);
                                        crossPlatformAlert('', '이미지 업로드 오류 발생');
                                    }
                                }
                            }}
                        />
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
    // pageWrapper, container 등은 이전과 동일
    pageWrapper: {
        height: 'calc(100vh - 80px)',
        padding: '20px',
        boxSizing: 'border-box',
        backgroundColor: '#f8f9fa',
    },
    container: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#fff',
        padding: '20px',
        boxSizing: 'border-box',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
    },
    // [추가] 폼 섹션 스타일
    formSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px', // [핵심] 두 줄 사이의 수직 간격
    },
    // [유지] 행 컨테이너 스타일 (재사용)
    rowContainer: {
        display: 'flex',
        flexDirection: 'row',
        gap: '20px', // 각 항목 사이의 수평 간격
    },
    // [유지] 폼 그룹 스타일
    formGroup: {
        flex: 1, // 행 내에서 1:1 비율로 너비를 나눔
    },
    editorSection: {
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        marginTop: '20px',
    },
    editorWrapper: {
        flexGrow: 1,
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        overflow: 'hidden',
    },
    buttonSection: {
        marginTop: '10px',
        textAlign: 'right',
    },
    label: { fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: '#495057', display: 'block' },
    input: {
        width: '100%',
        border: '1px solid #dee2e6',
        padding: '12px',
        fontSize: '16px',
        borderRadius: '4px',
        boxSizing: 'border-box',
    },
    submitButton: {
        backgroundColor: '#007bff',
        color: 'white',
        padding: '15px',
        borderRadius: '5px',
        textAlign: 'center',
        fontSize: '14px',
        fontWeight: 'bold',
        border: 'none',
        cursor: 'pointer',
    },
};

export default AddProductWeb;
