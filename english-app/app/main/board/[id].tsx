import apiClient from '@/api';
import PermitCustomButton from '@/components/common/PermitButtonProps';
import RefuseCustomButton from '@/components/common/RefuseButtonProps';
import { useUserStore } from '@/store/userStore';
import { crossPlatformAlert, crossPlatformConfirm } from '@/utils/crossPlatformAlert';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
// 공지사항 상세 데이터 타입을 정의합니다 (백엔드 DTO와 일치시켜야 함)
interface Announcement {
    id: number;
    title: string;
    content: string;
    authorName: string; // 예시: 작성자 이름
    createdAt: string; // 예시: 작성일
    viewCount: number; // 예시: 조회수
    // images: { imageUrl: string }[]; // 이미지가 있다면 이와 같이 추가
}
const AnnouncementDetail = () => {
    // 1. URL로부터 ID를 추출합니다.
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { user } = useUserStore();
    const [announcement, setAnnouncement] = useState<Announcement | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // id가 유효한 경우에만 API를 호출합니다.
        if (id) {
            const fetchAnnouncement = async () => {
                try {
                    // 2. 추출한 ID로 백엔드에 특정 공지사항 데이터를 요청합니다.
                    const response = await apiClient.get<Announcement>(`/api/announcements/${id}`);
                    setAnnouncement(response.data);
                } catch (error) {
                    console.error("공지사항 상세 정보를 불러오는데 실패했습니다.", error);
                    crossPlatformAlert("오류", "데이터를 불러올 수 없습니다.");
                } finally {
                    setIsLoading(false);
                }
            };

            fetchAnnouncement();
        }
    }, [id]); // id가 변경될 때마다 데이터를 다시 불러옵니다.

    const handleEdit = () => {
        router.push(`/admin/announcement/${id}`);
    };

    const handleDelete = () => {
        if (!announcement) return;

        crossPlatformConfirm(
            "삭제 확인",
            `'${announcement.title}' 공지사항을 정말로 삭제하시겠습니까?`,
            async () => { // '확인'을 눌렀을 때 실행될 콜백 함수
                try {
                    await apiClient.delete(`/api/announcements/${id}`);
                    crossPlatformAlert("성공", "공지사항이 삭제되었습니다.");
                    router.back();
                } catch (error) {
                    console.error("공지사항 삭제 실패:", error);
                    crossPlatformAlert("오류", "삭제 중 오류가 발생했습니다.");
                }
            }
        );
    };

    // 로딩 중일 때 로딩 인디케이터를 표시합니다.
    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    // 데이터가 없거나 로드에 실패했을 경우 메시지를 표시합니다.
    if (!announcement) {
        return (
            <View style={styles.centered}>
                <Text>공지사항을 찾을 수 없습니다.</Text>
            </View>
        );
    }

    // 3. 받아온 데이터로 화면을 렌더링합니다.
    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{announcement.title}</Text>
                <View style={styles.metaContainer}>
                    <Text style={styles.metaText}>작성자: {announcement.authorName}</Text>
                    <Text style={styles.metaText}>작성일: {new Date(announcement.createdAt).toLocaleDateString()}</Text>
                    <Text style={styles.metaText}>조회수: {announcement.viewCount}</Text>
                </View>
            </View>
            {
                user?.role === 'ADMIN' && (
                    <View style={styles.buttonContainer}>
                        <PermitCustomButton
                            title="수정"
                            onPress={handleEdit}
                            style={styles.editButtonMargin} // 버튼 간 간격을 위한 스타일
                        />
                        {/* [수정!] RefuseCustomButton으로 교체 */}
                        <RefuseCustomButton
                            title="삭제"
                            onPress={handleDelete}
                        />
                    </View>
                )
            }
            <View>
                {/* Webview 등을 사용하여 HTML 컨텐츠를 렌더링 할 수 있습니다. */}
                <Text style={styles.content}>{announcement.content}</Text>
            </View>
        </ScrollView>
    );
};
const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    header: {
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 16,
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    metaContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between', // Adjust as needed
    },
    metaText: {
        fontSize: 12,
        color: '#666',
    },
    content: {
        fontSize: 16,
        lineHeight: 24,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 16,
    },
    editButtonMargin: {
        marginRight: 10, // 수정 버튼과 삭제 버튼 사이의 간격
    },
});
export default AnnouncementDetail;
