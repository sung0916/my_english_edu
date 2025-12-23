import apiClient from '@/api';
import PermitCustomButton from '@/components/common/PermitButtonProps';
import RefuseCustomButton from '@/components/common/RefuseButtonProps';
import { useUserStore } from '@/store/userStore';
import { crossPlatformAlert, crossPlatformConfirm } from '@/utils/crossPlatformAlert';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import WebView from 'react-native-webview';

// 이미지 데이터 인터페이스
interface AnnouncementImage {
    id: number;
    imageUrl: string;
}

// 작성자 객체 세부화 인터페이스
interface Author {
    userId: number;
    username: string;
}

// 공지사항 상세 데이터 타입을 정의합니다 (백엔드 DTO와 일치시켜야 함)
interface Announcement {
    id: number;
    title: string;
    content: string;
    author: Author; // 예시: 작성자 이름
    createdAt: string; // 예시: 작성일
    viewCount: number; // 예시: 조회수
    images: AnnouncementImage[]; // 이미지가 있다면 이와 같이 추가
}

const webGlobalStyles = `
    .description-container img {
        max-width: 100%;
        height: auto;
        object-fit: contain;
    }
`;

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

    // HTML 렌더링 헬퍼 컴포넌트
    const DescriptionRender = ({ htmlContent }: { htmlContent: string }) => {
        if (Platform.OS === 'web') {  // 웹 환경
            return (
                <>
                    <style>{webGlobalStyles}</style>
                    <div
                        className='description-container'
                        style={styles.descriptionWeb}
                        dangerouslySetInnerHTML={{__html: htmlContent}}
                    />
                </>
            );

        } else {  // 모바일 환경
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
                                color: #333;
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
                    style={{ width: '100%', height: 400 }}
                    scrollEnabled={false}
                />
            );
        }
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
                    <Text style={styles.metaText}>작성자: {announcement.author.username}</Text>
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
                        <RefuseCustomButton
                            title="삭제"
                            onPress={handleDelete}
                        />
                    </View>
                )
            }

            <View style={styles.contentContainer}>
                {/* Webview 등을 사용하여 HTML 컨텐츠를 렌더링 할 수 있습니다. */}
                <DescriptionRender htmlContent={announcement.content} />
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
    mainImage: {
        width: '100%',
        height: 300, // 높이는 적절히 조절하거나 aspect ratio를 사용할 수 있습니다.
        marginBottom: 10,
        backgroundColor: '#f9f9f9', // 로딩 전 배경색
        borderRadius: 8,
    },
    contentContainer: {
        paddingBottom: 40, // 하단 여백 확보
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 16,
    },
    editButtonMargin: {
        marginRight: 10, // 수정 버튼과 삭제 버튼 사이의 간격
    },
    descriptionWeb: {
        fontSize: 16,
        lineHeight: 1.6,
        color: '#333',
    } as any,
});

export default AnnouncementDetail;
