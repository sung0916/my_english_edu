import { useCartStore } from "@/store/useCartStore";
import { useUserStore } from "@/store/userStore";
import { CartItem } from "@/types/cart";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// 숫자 포맷
const formatPrice = (price: number) => price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

// 결제 수단 타입
type PaymentMethod = 'TOSS' | 'KAKAO' | 'CARD' | 'MOBILE';

export default function CartPage() {
  const router = useRouter();
  const { isLoggedIn } = useUserStore();
  const { items, fetchCart, updateItemAmount, removeItem } = useCartStore();

  const [isLoading, setIsLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('TOSS');

  // 1. 초기 데이터 로드
  useEffect(() => {
    if (!isLoggedIn) {
      alert('로그인이 필요합니다.');
      router.replace('/auth/login');
      return;
    }
    loadCartData();
  }, [isLoggedIn]);

  const loadCartData = async () => {
    setIsLoading(true);
    await fetchCart();
    setIsLoading(false);
  };

  // 2. 데이터 로드 후 '판매중'인 상품만 기본 전체 선택
  useEffect(() => {
    if (items.length > 0) {
      const validIds = items
        .filter(item => item.status === 'ONSALE')
        .map(item => item.cartId);
      setSelectedIds(new Set(validIds));
    }
  }, [items]);

  // --- [로직] 선택 관련 ---
  
  // 전체 선택/해제 토글
  const handleSelectAll = () => {
    const validItems = items.filter(item => item.status === 'ONSALE');
    
    if (selectedIds.size === validItems.length) {
      setSelectedIds(new Set()); // 모두 해제
    } else {
      const allIds = validItems.map(item => item.cartId);
      setSelectedIds(new Set(allIds)); // 모두 선택
    }
  };

  // 개별 선택 토글
  const handleToggleItem = (cartId: number, status: string) => {
    if (status !== 'ONSALE') return; // 판매중지 상품은 선택 불가

    const newSet = new Set(selectedIds);
    if (newSet.has(cartId)) {
      newSet.delete(cartId);
    } else {
      newSet.add(cartId);
    }
    setSelectedIds(newSet);
  };

  // 선택 삭제
  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) {
      alert("삭제할 상품을 선택해주세요.");
      return;
    }

    // 확인 절차
    if (Platform.OS === 'web') {
       if (!confirm(`${selectedIds.size}개 상품을 삭제하시겠습니까?`)) return;
    } else {
        // 모바일은 Alert 사용 (비동기 처리 필요하지만 간단히 구현)
    }

    try {
      // Promise.all로 병렬 삭제 처리 (API가 bulk delete 지원 안할 경우)
      const deletePromises = Array.from(selectedIds).map(id => removeItem(id));
      await Promise.all(deletePromises);
      setSelectedIds(new Set()); // 선택 초기화
      // removeItem 내부에서 fetchCart를 호출하므로 자동 갱신됨
    } catch (error) {
      console.error("삭제 중 오류", error);
    }
  };

  // 수량 변경
  const handleQuantityChange = async (cartId: number, currentAmount: number, change: number) => {
    const newAmount = currentAmount + change;
    await updateItemAmount(cartId, newAmount);
  };

  // --- [계산] 총 금액 ---
  const { totalProductPrice, finalPrice } = useMemo(() => {
    const selectedItems = items.filter(item => selectedIds.has(item.cartId));
    const total = selectedItems.reduce((sum, item) => sum + item.totalPrice, 0);
    
    return {
      totalProductPrice: total,
      finalPrice: total // 배송비 없음
    };
  }, [items, selectedIds]);


  // --- [렌더링] 개별 아이템 ---
  const renderItem = ({ item }: { item: CartItem }) => {
    const isSale = item.status === 'ONSALE';
    const isChecked = selectedIds.has(item.cartId);

    return (
      <View style={[styles.card, !isSale && styles.cardDisabled]}>
        {/* 체크박스 영역 */}
        <Pressable 
          style={styles.checkboxContainer} 
          onPress={() => handleToggleItem(item.cartId, item.status)}
          disabled={!isSale}
        >
          {isSale ? (
            <Ionicons 
              name={isChecked ? "checkbox" : "square-outline"} 
              size={24} 
              color={isChecked ? "#4A90E2" : "#ccc"} 
            />
          ) : (
            <Ionicons name="square" size={24} color="#e0e0e0" />
          )}
        </Pressable>

        {/* 상품 정보 영역 */}
        <View style={styles.cardContent}>
          <Text style={styles.headerTitle}>
            {item.productName} 
            {!isSale && <Text style={styles.soldOutBadge}> (판매중지)</Text>}
          </Text>
          
          <View style={styles.productBody}>
            <Image 
              source={{ uri: item.thumbnailImageUrl || 'https://via.placeholder.com/80' }} 
              style={[styles.image, !isSale && { opacity: 0.5 }]} 
            />
            
            <View style={styles.infoCol}>
              <Text style={styles.priceText}>{formatPrice(item.price)}원</Text>
              {isSale && (
                <Text style={styles.deliveryTag}>🚀 로켓배송</Text>
              )}
            </View>
          </View>

          {/* 컨트롤러 (수량/삭제) */}
          {isSale && (
            <View style={styles.controlRow}>
              <View style={styles.counter}>
                <Pressable onPress={() => handleQuantityChange(item.cartId, item.amount, -1)} style={styles.countBtn}>
                  <Feather name="minus" size={16} color="#555" />
                </Pressable>
                <Text style={styles.countText}>{item.amount}</Text>
                <Pressable onPress={() => handleQuantityChange(item.cartId, item.amount, 1)} style={styles.countBtn}>
                  <Feather name="plus" size={16} color="#555" />
                </Pressable>
              </View>
              <Text style={styles.itemTotal}>{formatPrice(item.totalPrice)}원</Text>
            </View>
          )}

          {/* 우상단 삭제 버튼 */}
          <Pressable style={styles.deleteBtn} onPress={() => removeItem(item.cartId)}>
            <Feather name="x" size={18} color="#999" />
          </Pressable>
        </View>
      </View>
    );
  };

  // --- [렌더링] 결제 수단 컴포넌트 ---
  const PaymentOption = ({ method, label, color, icon }: any) => (
    <Pressable 
      style={[styles.payOption, paymentMethod === method && styles.payOptionSelected]}
      onPress={() => setPaymentMethod(method)}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <MaterialCommunityIcons 
          name={paymentMethod === method ? "radiobox-marked" : "radiobox-blank"} 
          size={24} 
          color={paymentMethod === method ? "#4A90E2" : "#ccc"} 
        />
        <View style={[styles.iconBox, { backgroundColor: color }]}>
            {/* 아이콘 이미지가 없어서 텍스트나 기본 아이콘으로 대체 */}
            <Text style={{fontSize: 10, color: '#fff', fontWeight: 'bold'}}>{label[0]}</Text>
        </View>
        <Text style={styles.payLabel}>{label}</Text>
      </View>
    </Pressable>
  );

  if (isLoading && items.length === 0) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* 1. 상단 타이틀 */}
        <View style={styles.pageHeader}>
            <Text style={styles.pageTitle}>장바구니({items.length})</Text>
        </View>

        {/* 2. 전체 선택 / 선택 삭제 바 */}
        <View style={styles.selectionBar}>
            <Pressable style={styles.selectAllBtn} onPress={handleSelectAll}>
                <Ionicons 
                    name={items.length > 0 && selectedIds.size === items.filter(i => i.status === 'ONSALE').length ? "checkbox" : "square-outline"} 
                    size={22} 
                    color="#4A90E2" 
                />
                <Text style={styles.selectText}>전체 선택 ({selectedIds.size}/{items.length})</Text>
            </Pressable>
            <Pressable style={styles.deleteSelectedBtn} onPress={handleDeleteSelected}>
                <Text style={styles.deleteSelectedText}>선택 삭제</Text>
            </Pressable>
        </View>

        {/* 3. 상품 리스트 */}
        <View style={styles.listSection}>
             <FlatList
                data={items}
                keyExtractor={item => item.cartId.toString()}
                renderItem={renderItem}
                scrollEnabled={false} // 부모 ScrollView 사용
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>장바구니가 비어있습니다.</Text>
                    </View>
                }
             />
        </View>

        {/* 4. 결제 수단 선택 */}
        {selectedIds.size > 0 && (
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>결제수단</Text>
                <View style={styles.payGroup}>
                    <PaymentOption method="TOSS" label="토스페이" color="#0050FF" />
                    <PaymentOption method="KAKAO" label="카카오페이" color="#FEE500" />
                    <PaymentOption method="CARD" label="신용카드" color="#333" />
                    <PaymentOption method="MOBILE" label="휴대폰결제" color="#2DB400" />
                </View>
            </View>
        )}

        {/* 5. 주문 예상 금액 (요약) */}
        <View style={styles.summarySection}>
            <Text style={styles.sectionTitle}>주문 예상 금액</Text>
            <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>총 상품 가격</Text>
                <Text style={styles.summaryValue}>{formatPrice(totalProductPrice)}원</Text>
            </View>
            <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>총 배송비</Text>
                <Text style={styles.summaryValue}>0원</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>총 결제금액</Text>
                <Text style={styles.totalValue}>{formatPrice(finalPrice)}원</Text>
            </View>
        </View>

        {/* 하단 여백 (버튼에 가려지지 않게) */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* 6. 하단 고정 구매 버튼 */}
      <View style={styles.bottomBar}>
          <Pressable 
            style={[styles.checkoutBtn, selectedIds.size === 0 && styles.checkoutBtnDisabled]}
            disabled={selectedIds.size === 0}
            onPress={() => alert(`${formatPrice(finalPrice)}원 결제하기 (${paymentMethod})`)}
          >
              <Text style={styles.checkoutBtnText}>
                  총 {selectedIds.size}개 상품 구매하기
              </Text>
          </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f6', // 연한 회색 배경
  },
  scrollContent: {
    paddingBottom: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // 헤더
  pageHeader: {
      padding: 20,
      backgroundColor: '#fff',
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
  },
  pageTitle: {
      fontSize: 20,
      fontWeight: 'bold',
  },

  // 선택 바
  selectionBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#fff',
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginBottom: 10,
  },
  selectAllBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
  },
  selectText: {
      fontSize: 14,
      color: '#333',
  },
  deleteSelectedBtn: {
      padding: 6,
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 4,
  },
  deleteSelectedText: {
      fontSize: 12,
      color: '#666',
  },

  // 리스트 영역
  listSection: {
      marginBottom: 10,
  },
  
  // 카드 스타일
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 2, // 카드 사이 간격
  },
  cardDisabled: {
      backgroundColor: '#f9f9f9',
  },
  checkboxContainer: {
      justifyContent: 'flex-start',
      paddingTop: 4,
      marginRight: 12,
  },
  cardContent: {
      flex: 1,
      position: 'relative',
  },
  headerTitle: {
      fontSize: 15,
      color: '#333',
      marginBottom: 8,
      lineHeight: 20,
      paddingRight: 20, // 삭제 버튼 공간
  },
  soldOutBadge: {
      color: '#e74c3c',
      fontWeight: 'bold',
      fontSize: 13,
  },
  productBody: {
      flexDirection: 'row',
      marginBottom: 12,
  },
  image: {
      width: 70,
      height: 70,
      borderRadius: 6,
      backgroundColor: '#eee',
      marginRight: 12,
  },
  infoCol: {
      justifyContent: 'center',
  },
  priceText: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 4,
  },
  deliveryTag: {
      fontSize: 11,
      color: '#00891A', // 네이버/쿠팡 초록색
      backgroundColor: '#E8F7EC',
      alignSelf: 'flex-start',
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 2,
  },
  
  // 수량 조절
  controlRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#f8f9fa',
      padding: 8,
      borderRadius: 6,
  },
  counter: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#fff',
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 4,
  },
  countBtn: {
      paddingHorizontal: 10,
      paddingVertical: 4,
  },
  countText: {
      width: 30,
      textAlign: 'center',
      fontSize: 14,
  },
  itemTotal: {
      fontSize: 14,
      fontWeight: '600',
  },
  deleteBtn: {
      position: 'absolute',
      top: 0,
      right: 0,
      padding: 4,
  },

  // 섹션 공통
  section: {
      backgroundColor: '#fff',
      padding: 20,
      marginBottom: 10,
  },
  sectionTitle: {
      fontSize: 17,
      fontWeight: 'bold',
      marginBottom: 16,
      color: '#333',
  },

  // 결제 수단
  payGroup: {
      gap: 12,
  },
  payOption: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderWidth: 1,
      borderColor: '#eee',
      borderRadius: 8,
  },
  payOptionSelected: {
      borderColor: '#4A90E2',
      backgroundColor: '#F0F7FF',
  },
  iconBox: {
      width: 24,
      height: 24,
      borderRadius: 12,
      marginLeft: 10,
      marginRight: 10,
      alignItems: 'center',
      justifyContent: 'center',
  },
  payLabel: {
      fontSize: 15,
      color: '#333',
  },

  // 요약 영역
  summarySection: {
      backgroundColor: '#fff',
      padding: 20,
      marginBottom: 20,
  },
  summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
  },
  summaryLabel: { color: '#666' },
  summaryValue: { fontSize: 15, color: '#333' },
  divider: {
      height: 1,
      backgroundColor: '#eee',
      marginVertical: 14,
  },
  totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  totalLabel: { fontSize: 18, fontWeight: 'bold' },
  totalValue: { fontSize: 24, fontWeight: 'bold', color: '#333' },

  // 하단 고정 바
  bottomBar: {
      position: Platform.OS === 'web' ? 'fixed' : 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#fff',
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: '#eee',
      // 그림자
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 10,
  },
  checkoutBtn: {
      backgroundColor: '#4A90E2',
      paddingVertical: 16,
      borderRadius: 8,
      alignItems: 'center',
  },
  checkoutBtnDisabled: {
      backgroundColor: '#ccc',
  },
  checkoutBtnText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
  },

  emptyContainer: {
      padding: 40,
      alignItems: 'center',
  },
  emptyText: {
      color: '#999',
  }
});
