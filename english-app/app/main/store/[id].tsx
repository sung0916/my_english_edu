import apiClient from "@/api";
import PermitCustomButton from "@/components/common/PermitButtonProps";
import { useCartStore } from "@/store/useCartStore";
import { useUserStore } from "@/store/userStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import WebView from "react-native-webview";

const webGlobalStyles = `
    .description-container img {
        max-width: 100%;
        height: auto;
        display: block;
        margin: 20px auto;
    }
`;

// 백엔드의 ProductResponse DTO 구조와 이름 통일한 인터페이스
interface ImageDetail {
    imageId: number;
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

const ProductDetailPage = () => {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { user, isLoggedIn } = useUserStore();
    const { addToCart } = useCartStore();
    const [product, setProduct] = useState<ProductDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [isAddingCart, setIsAddingCart] = useState(false);

    useEffect(() => {
        // id가 유효할 때만 API 호출
        if (id) {
            const fetchProductsDetail = async () => {
                try {
                    const response = await apiClient.get<ProductDetail>(`/api/products/${id}`);
                    setProduct(response.data);
                    if (response.data.images && response.data.images.length > 0) {
                        setSelectedImage(response.data.images[0].imageUrl);
                    }

                } catch (error) {
                    console.error('상품 정보를 불러오는 데 실패', error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchProductsDetail();
        }
    }, [id]);  // id가 변경될 때마다 다시 데이터 불러오기

    const handleQuantityChange = (change: number) => {
        const newQuantity = quantity + change;
        if (newQuantity >= 1 && newQuantity <= (product?.amount || 999)) {
            setQuantity(newQuantity);
        }
    };

    const handleAddToCart = async () => {
        if (!isLoggedIn) {
            alert('Please Log in first');
            router.push('/auth/login');
            return;
        }
        if (!product) return;

        try {
            setIsAddingCart(true);
            // useCartStore의 addToCart 액션 호출 (API 연동됨)
            await addToCart(product.id, quantity);

            // 성공 시 알림 및 사용자 선택 유도
            if (Platform.OS === 'web') {
                // 웹: confirm 창 사용
                alert("장바구니에 담았습니다.");
            } else {
                // 앱: Alert 사용
                alert("장바구니에 담았습니다.");
                // 필요 시 장바구니 이동 로직 추가
            }

        } catch (error) {
            console.error(error);
            alert("장바구니 담기에 실패했습니다.");
        } finally {
            setIsAddingCart(false);
        }
    };

    const handleEditPress = () => {
        // 관리자 전용 수정 페이지로 이동
        router.push(`/admin/product/${id}`);
    };

    const handleBuyNow = () => {
        if (!isLoggedIn) {
            alert("로그인이 필요합니다.");
            router.push('/auth/login');
            return;
        }
        // 바로 구매 로직 (예: 결제 페이지로 수량/상품ID 넘기기)
        router.push(`/user/payment?productId=${id}&amount=${quantity}`);
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
                        style={{ fontSize: '16px', lineHeight: '1.6', color: '#333' }}
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
                    style={{ width: '100%', height: 600 }}
                    scrollEnabled={false}
                // WebView 높이 자동 조절 스크립트 (필요 시)
                />
            );
        }
    };

    if (isLoading) return <ActivityIndicator size="large" style={styles.centered} />;
    if (!product) return <View style={styles.centered}><Text>상품을 찾을 수 없습니다.</Text></View>;
    const isWeb = Platform.OS === 'web';

    return (
        <ScrollView style={styles.container}>
            {/* [레이아웃] 웹이면 Row(가로), 앱이면 Column(세로) 배치 */}
            <View style={[styles.topSection, isWeb && styles.topSectionWeb]}>

                {/* 1. 왼쪽: 이미지 갤러리 섹션 */}
                <View style={[styles.gallerySection, isWeb && styles.gallerySectionWeb]}>
                    <View style={styles.mainImageContainer}>
                        {selectedImage ? (
                            <Image
                                source={{ uri: selectedImage }}
                                style={styles.mainImage}
                                resizeMode="contain"
                            />
                        ) : (
                            <View style={[styles.mainImage, styles.noImage]}><Text>No Image</Text></View>
                        )}
                    </View>

                    {/* 썸네일 리스트 */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailList}>
                        {product.images.map((img, index) => (
                            <TouchableOpacity
                                key={img.imageId || index}
                                onPress={() => setSelectedImage(img.imageUrl)}
                                style={[
                                    styles.thumbnailWrapper,
                                    selectedImage === img.imageUrl && styles.thumbnailSelected
                                ]}
                            >
                                <Image source={{ uri: img.imageUrl }} style={styles.thumbnail} />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* 2. 오른쪽: 상품 정보 및 구매 섹션 */}
                <View style={[styles.infoSection, isWeb && styles.infoSectionWeb]}>
                    <Text style={styles.productName}>{product.productName}</Text>

                    {/* 가격 정보 */}
                    <View style={styles.priceContainer}>
                        <Text style={styles.priceText}>{product.price.toLocaleString()}원</Text>
                    </View>

                    <View style={styles.divider} />

                    {/* 수량 선택 */}
                    <View style={styles.optionRow}>
                        <Text style={styles.optionLabel}>수량</Text>
                        <View style={styles.quantityControl}>
                            <TouchableOpacity onPress={() => handleQuantityChange(-1)} style={styles.qtyBtn}>
                                <Text>-</Text>
                            </TouchableOpacity>
                            <Text style={styles.qtyValue}>{quantity}</Text>
                            <TouchableOpacity onPress={() => handleQuantityChange(1)} style={styles.qtyBtn}>
                                <Text>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* 총 금액 */}
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>총 상품금액</Text>
                        <Text style={styles.totalPrice}>{(product.price * quantity).toLocaleString()}원</Text>
                    </View>

                    {/* 버튼 그룹 (장바구니 / 바로구매) */}
                    <View style={styles.actionButtons}>
                        <TouchableOpacity 
                            style={[styles.btn, styles.cartBtn]} 
                            onPress={handleAddToCart}
                            disabled={isAddingCart}
                        >
                            {isAddingCart ? (
                                <ActivityIndicator color="#333" />
                            ) : (
                                <Text style={styles.cartBtnText}>장바구니 담기</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.btn, styles.buyBtn]} 
                            onPress={handleBuyNow}
                        >
                            <Text style={styles.buyBtnText}>바로구매</Text>
                        </TouchableOpacity>
                    </View>

                    {/* 관리자 버튼 (수정/삭제) */}
                    {user?.role === 'ADMIN' && (
                        <View style={styles.adminButtons}>
                            <PermitCustomButton title="수정" onPress={() => router.push(`/admin/product/${id}`)} />
                        </View>
                    )}
                </View>
            </View>

            {/* 3. 하단: 상세 설명 (HTML) */}
            <View style={styles.descriptionSection}>
                <Text style={styles.sectionTitle}>상품 상세 정보</Text>
                <View style={styles.descriptionContent}>
                    <DescriptionRenderer htmlContent={product.description} />
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    container: { flex: 1, backgroundColor: '#fff' },

    // 상단 섹션 (이미지 + 정보)
    topSection: { flexDirection: 'column', padding: 16 },
    topSectionWeb: { flexDirection: 'row', maxWidth: 1200, alignSelf: 'center', width: '100%', paddingVertical: 40 },

    // 갤러리 섹션
    gallerySection: { marginBottom: 20 },
    gallerySectionWeb: { width: '50%', paddingRight: 40, marginBottom: 0 },
    mainImageContainer: { width: '100%', aspectRatio: 1, backgroundColor: '#f8f9fa', borderRadius: 8, overflow: 'hidden', marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
    mainImage: { width: '100%', height: '100%' },
    noImage: { justifyContent: 'center', alignItems: 'center' },
    thumbnailList: { flexDirection: 'row' },
    thumbnailWrapper: { width: 60, height: 60, marginRight: 10, borderWidth: 1, borderColor: 'transparent', borderRadius: 4, overflow: 'hidden' },
    thumbnailSelected: { borderColor: '#346aff', borderWidth: 2 },
    thumbnail: { width: '100%', height: '100%' },

    // 정보 섹션
    infoSection: { flex: 1 },
    infoSectionWeb: { width: '50%', paddingLeft: 20, justifyContent: 'flex-start' },
    productName: { fontSize: 22, fontWeight: 'bold', color: '#111', marginBottom: 10 },
    priceContainer: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 20 },
    priceText: { fontSize: 28, fontWeight: 'bold', color: '#ae0000', marginRight: 10 },
    shippingText: { fontSize: 14, color: '#00891a', backgroundColor: '#eaffef', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    divider: { height: 1, backgroundColor: '#eee', marginVertical: 20 },

    // 옵션 & 수량
    optionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    optionLabel: { fontSize: 14, fontWeight: 'bold', width: 60 },
    quantityControl: { flexDirection: 'row', borderWidth: 1, borderColor: '#ddd', borderRadius: 4 },
    qtyBtn: { width: 30, height: 30, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9f9f9' },
    qtyValue: { width: 40, height: 30, textAlign: 'center', lineHeight: 30, fontSize: 14, borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#ddd' },

    // 총 금액
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, padding: 15, backgroundColor: '#f9f9f9', borderRadius: 4 },
    totalLabel: { fontSize: 14, fontWeight: 'bold' },
    totalPrice: { fontSize: 20, fontWeight: 'bold', color: '#ae0000' },

    // 버튼들
    actionButtons: { flexDirection: 'row', gap: 10, height: 50 },
    btn: { flex: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 4 },
    cartBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#346aff' },
    cartBtnText: { color: '#346aff', fontSize: 16, fontWeight: 'bold' },
    buyBtn: { backgroundColor: '#346aff' },
    buyBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    adminButtons: { flexDirection: 'row', marginTop: 20, justifyContent: 'flex-end', gap: 10 },

    // 하단 상세 설명
    descriptionSection: { padding: 16, borderTopWidth: 10, borderTopColor: '#f0f0f0', marginTop: 20 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
    descriptionContent: { minHeight: 300 },
});

export default ProductDetailPage;
