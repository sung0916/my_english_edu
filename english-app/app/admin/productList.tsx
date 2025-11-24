import apiClient from "@/api";
import { Pagination } from "@/components/common/Pagination";
import SearchBox, { SearchOption } from "@/components/common/SearchBox";
import { crossPlatformAlert } from "@/utils/crossPlatformAlert";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const ITEMS_PER_PAGE = 10;

// 백엔드 ProductStatus Enum과 동일하게 정의
type ProductStatus = 'ONSALE' | 'NOTONSALE';

// 상품 데이터 인터페이스
interface Product {
    id: number;
    productName: string;
    salesVolume: number;
    status: ProductStatus;
}

// API 응답 페이지 구조 인터페이스
interface Page<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
}

const ProductList = () => {
    const router = useRouter();

    // TODO: 실제 검색 기능 구현 시 필요한 옵션
    const productSearchOptions: SearchOption[] = [
        { value: 'productName', label: '상품명' },
    ];

    const [isLoading, setIsLoading] = useState(true);
    const [products, setProducts] = useState<Product[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const fetchProducts = useCallback(async (page: number) => {
        setIsLoading(true);

        try {
            // 상품 목록 조회 API 엔드포인트 호출
            const response = await apiClient.get<Page<Product>>('/api/products/list', {
                params: {
                    page: page - 1,
                    size: ITEMS_PER_PAGE,
                    sort: 'id,desc',
                },
            });

            setProducts(response.data.content);
            setTotalItems(response.data.totalElements);

        } catch (error) {
            console.error('상품 목록을 불러오는 데 실패', error);
            crossPlatformAlert('오류', '상품 목록 불러오기 실패');

        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts(currentPage);
    }, [currentPage, fetchProducts]);

    const handleSearch = (type: string, query: string) => {
        console.log(`상품 검색 실팽 >> 조건: ${type}, 검색어: ${query}`);
        // TODO: 검색 API 연동 로직 구현
    }

    // 상품 상태 변경 핸들러
    const handleStatusChange = async (productId: number, newStatus: ProductStatus) => {
        const originalProducts = [...products];
        const updatedProducts = products.map(product =>
            product.id === productId ? {...product, status: newStatus} : product
        );
        setProducts(updatedProducts);

        try {
            await apiClient.patch('/api/products/edit', {
                id: productId,
                status: newStatus,
            });
            // crossPlatformAlert('성공', '상품 상태가 변경됨');

            // // 상태 변경 후 즉시 새로고침하여 목록 반영
            // fetchProducts(currentPage);

        } catch (error) {
            console.error('상품 상태 변경 실패: ', error);
            crossPlatformAlert('오류', '상태 변경 중 오류 발생');
            setProducts(originalProducts);
        }
    };
    
    const handleRowPress = (id: number) => {
        // 상품 수정 버튼은 관리자일 때 보이도록 상세페이지에서 지정
        router.push(`/main/store/${id}`);
    };

    const renderTableHeader = () => (
        <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, { flex: 1 }]}>번호</Text>
            <Text style={[styles.headerCell, { flex: 3.5 }]}>상품명</Text>
            <Text style={[styles.headerCell, { flex: 1.5 }]}>판매량</Text>
            <Text style={[styles.headerCell, { flex: 1.5 }]}>관리</Text>
        </View>
    );

    const renderProductRow = ({ item }: { item: Product }) => (
        <TouchableOpacity onPress={() => handleRowPress(item.id)} style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 1 }]}>{item.id}</Text>
            <Text style={[styles.tableCell, { flex: 3.5, textAlign: 'left', paddingLeft: 10 }]}>
                {item.productName}
            </Text>
            <Text style={[styles.tableCell, { flex: 1.5 }]}>{item.salesVolume}</Text>
            <View style={[styles.tableCell, { flex: 1.5, paddingVertical: 0 }]}>
                <Pressable
                    onPress={(event) => event.stopPropagation()}
                    style={[styles.tableCell, { flex: 1.5, paddingVertical: 0 }]}
                >
                    <Picker
                        selectedValue={item.status}
                        onValueChange={(itemValue) => handleStatusChange(item.id, itemValue)}
                        style={styles.picker}
                        itemStyle={styles.pickerItem}  // IOS 스타일링
                    >
                        <Picker.Item label="판매 중" value="ONSALE" />
                        <Picker.Item label="판매 중지" value="NOTONSALE" />
                    </Picker>
                </Pressable>
            </View>
        </TouchableOpacity>
    );

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <View style={styles.safeArea}>
            <SearchBox options={productSearchOptions} onSearch={handleSearch} />

            <View style={styles.listContainer}>
                <FlatList
                    data={products}
                    renderItem={renderProductRow}
                    keyExtractor={(item) => item.id.toString()}
                    ListHeaderComponent={renderTableHeader}
                    ListEmptyComponent={<Text style={styles.emptyText}>등록된 상품이 없습니다.</Text>}
                />
            </View>

            <View style={styles.bottomContainer}>
                <View style={{ flex: 1 }} />
                <TouchableOpacity
                    style={styles.registerButton}
                    onPress={() => router.push('/admin/addProduct')} // 상품 등록 페이지로 이동
                >
                    <Ionicons name="add-circle-outline" size={18} color="white" />
                    <Text style={styles.registerButtonText}>상품 등록</Text>
                </TouchableOpacity>
            </View>

            {totalItems > 0 && (
                <View style={styles.paginationContainer}>
                    <Pagination
                        currentPage={currentPage}
                        totalItems={totalItems}
                        itemsPerPage={ITEMS_PER_PAGE}
                        onPageChange={(page) => setCurrentPage(page)}
                    />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    safeArea: 
    { flex: 1, 
        backgroundColor: '#fff', 
        padding: 20 
    },
    listContainer: 
    { flex: 1, 
        marginTop: 16, 
        borderWidth: 1, 
        borderColor: '#dee2e6', 
        borderRadius: 4 
    },
    tableHeader: { 
        flexDirection: 'row', 
        backgroundColor: '#f8f9fa', 
        borderBottomWidth: 2, 
        borderColor: '#dee2e6', 
        paddingHorizontal: 10, 
        paddingVertical: 12 
    },
    headerCell: { 
        fontWeight: 'bold', 
        textAlign: 'center' 
    },
    tableRow: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        borderBottomWidth: 1, 
        borderColor: '#dee2e6', 
        paddingHorizontal: 10, 
        minHeight: 60 
    },
    tableCell: { 
        textAlign: 'center', 
        paddingVertical: 10, 
        color: '#495057' 
    },
    emptyText: { 
        textAlign: 'center', 
        marginTop: 50, 
        fontSize: 16, 
        color: 'gray' 
    },
    loadingContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    bottomContainer: { 
        flexDirection: 'row', 
        justifyContent: 'flex-end', 
        alignItems: 'center', 
        marginTop: 10, 
        minHeight: 40, 
    },
    // 글쓰기 -> 상품 등록 버튼 스타일
    registerButton: { 
        flexDirection: 'row', 
        backgroundColor: '#0f83ffff', 
        paddingHorizontal: 15, 
        paddingVertical: 10, 
        borderRadius: 5, 
        alignItems: 'center', 
        justifyContent: 'center' 
    },
    registerButtonText: { 
        color: 'white', 
        fontWeight: 'bold', 
        marginLeft: 5 
    },
    paginationContainer: { 
        paddingTop: 10, 
        alignItems: 'center' 
    },
    // Picker 스타일
    picker: {
        width: '100%',
        height: 35, // Android에서는 높이가 없으면 보이지 않을 수 있음
        textAlign: 'center',
    },
    pickerItem: {
        height: 50, // iOS에서는 itemStyle로 높이 조절
    }
});

export default ProductList;
