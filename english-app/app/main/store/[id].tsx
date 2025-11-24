import apiClient from "@/api";
import PermitCustomButton from "@/components/common/PermitButtonProps";
import { useUserStore } from "@/store/userStore";
import { crossPlatformAlert } from "@/utils/crossPlatformAlert";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import WebView from "react-native-webview";

// 백엔드의 ProductResponse DTO 구조와 이름 통일한 인터페이스
interface ImageDetail {
    id: number;
    imageUrl: string;
}

interface ProductDetail {
    id: number;
    productName: string;
    price: number;
    description: string;
    images: ImageDetail[];
    amount: number;
}

const webGlobalStyles = `
    .description-container img {
        max-width: 100%;
        height: auto;
        object-fit: contain;
    }
`;

const ProductDetailPage = () => {
    const router = useRouter();
    // url 경로에서 동적 파라미터(id) 가져오기
    const { id } = useLocalSearchParams<{ id: string }>();
    // Zustand 스토어에서 사용자 정보 가져오기
    const { user } = useUserStore();
    const [product, setProduct] = useState<ProductDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // id가 유효할 때만 API 호출
        if (id) {
            const fetchProductsDetail = async () => {
                try {
                    const response = await apiClient.get<ProductDetail>(`/api/products/${id}`);
                    setProduct(response.data);

                } catch (error) {
                    console.error('상품 정보를 불러오는 데 실패', error);
                    crossPlatformAlert('', '해당 상품 정보를 가져올 수 없습니다.');

                } finally {
                    setIsLoading(false);
                }
            };
            fetchProductsDetail();
        }
    }, [id]);  // id가 변경될 때마다 다시 데이터 불러오기

    const handleEditPress = () => {
        // 관리자 전용 수정 페이지로 이동
        router.push(`/admin/product/${id}`);
    };

    // 플랫폼에 따라 상세 설명을 렌더링하는 컴포넌트
    const DescriptionRenderer = ({ htmlContent }: { htmlContent: string }) => {
        if (Platform.OS === 'web') {
            // 웹 환경: dangerouslySetInnerHTML 사용
            return (
                <>
                    <style>{webGlobalStyles}</style>
                    <div
                        className="description-container"
                        style={styles.descriptionWeb}
                        dangerouslySetInnerHTML={{ __html: htmlContent }}
                    />
                </>
            );
        } else {
            // 모바일 환경: WebView 사용
            const htmlWithStyles = `
                <!DOCTYPE html>
                <html>
                    <head>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <style>
                            body {
                                margin: 0;
                                padding: 0;
                                font-size: 16px;
                                line-height: 1.6;
                                color: #666;
                            }
                            img {
                                max-width: 100%;
                                height: auto;
                            }
                        </style>
                    </head>
                    <body>
                        ${htmlContent}
                    </body>
                </html>
            `;

            return (
                <WebView
                    originWhitelist={['*']}
                    source={{ html: htmlWithStyles }}
                    style={styles.webview}
                    scrollEnabled={false}
                // WebView 높이 자동 조절 스크립트 (필요 시)
                />
            );
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size='large' />
            </View>
        );
    }

    if (!product) {
        return (
            <View style={styles.container}>
                <Text>상품 정보를 찾을 수 없습니다.</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* {product.images?.length > 0 && (
                <Image source={{ uri: product.images[0].imageUrl }} style={styles.mainImage} />
            )} */}

            <View style={styles.infoContainer}>
                <Text style={styles.title}>{product.productName}</Text>
                <Text style={styles.price}>{product.price.toLocaleString('ko-KR')}원</Text>

                <View style={styles.divider} />

                {user?.role === 'ADMIN' && (
                    <PermitCustomButton
                        title= "상품 수정하기"
                        style={styles.editButton} 
                        onPress={handleEditPress}
                    />
                )}

                {/* [수정] 조건부 렌더링 컴포넌트 호출 */}
                <DescriptionRenderer htmlContent={product.description || ""} />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    mainImage: {
        width: '100%',
        aspectRatio: 1,
    },
    infoContainer: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    price: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 20,
        color: '#333',
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        color: '#666',
    },
    editButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
    },
    editButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 20,
    },
    // [추가] 웹 전용 설명 스타일 (웹에서는 React Native StyleSheet가 아닌 일반 CSS처럼 동작)
    descriptionWeb: {
        fontSize: 16,
        lineHeight: 1.6,
        color: '#666',
    } as any, // TypeScript 에러 방지
    // [추가] 모바일 WebView 스타일
    webview: {
        width: '100%',
        height: 300, // 초기 높이, 자동 조절 스크립트로 변경 가능
    },
});

export default ProductDetailPage;
