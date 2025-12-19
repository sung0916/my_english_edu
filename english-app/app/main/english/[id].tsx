import { StyleSheet } from "react-native";

// 장소 별 프로그램 컨텐츠의 데이터 인터페이스
interface ProgramItem {
    id: number;
    title: string;
    description: string;
    imageUrl: string | null;
    contentRoute: string;  // 실행할 컨텐츠의 경로 (예: /english/places/school)
    type: 'WORD' | 'SENTENCE' | 'AUDIO';
}

const PlaceDetail = () => {

};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F9FC',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        marginRight: 15,
        padding: 5,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2C3E50',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#7F8C8D',
        marginTop: 2,
    },
    listContainer: {
        padding: 10,
    },
    itemContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        margin: 5,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E1E8ED',
        // 그림자
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    itemImage: {
        width: '100%',
        aspectRatio: 1.4, // 직사각형 비율
        resizeMode: 'cover',
    },
    imagePlaceholder: {
        width: '100%',
        aspectRatio: 1.4,
        backgroundColor: '#EFF0F4',
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemTextContainer: {
        padding: 12,
    },
    typeBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#E3F2FD',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginBottom: 6,
    },
    typeText: {
        fontSize: 10,
        color: '#1E88E5',
        fontWeight: 'bold',
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    itemDesc: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        color: '#999',
    },
});

export default PlaceDetail;