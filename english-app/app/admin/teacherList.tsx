import { Platform, StyleSheet, View } from "react-native";
import SearchBox, { SearchOption } from "../../components/common/SearchBox";
import { useEffect, useState } from "react";
import { Pagination } from "../../components/common/Pagination";

const ITEMS_PER_PAGE = 10;

const TeacherList = () => {
    const studentSearchOptions: SearchOption[] = [
        { value: 'userName', label: '이름' },
        { value: 'userId', label: '아이디' },
    ];

    const [teachers, setTeachers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalTeachers, setTotalTeachers] = useState(0);

    // --- 데이터 로딩 함수 (API 호출) ---
    const fetchTeachers = async () => {
        try {
            // 예시: /api/admin/users?page=1&size=10
            // const response = await apiClient.get(`/api/admin/users?page=${currentPage}&size=${ITEMS_PER_PAGE}`);
            // setStudents(response.data.content);
            // setTotalStudents(response.data.totalElements);

            // --- API 연동 전 임시 데이터 ---
            console.log(`${currentPage} 페이지의 학생 데이터를 불러옵니다.`);
            setTotalTeachers(55); 

        } catch (error) {
            console.error("학생 목록을 불러오는 데 실패했습니다.", error);
        }
    };

    // currentPage가 바뀔 때마다 학생 데이터를 새로 불러옴
    useEffect(() => {
        fetchTeachers();
    }, [currentPage]);

    const handleTeacherSearch = (type: string, query: string) => {
        console.log(`선생님 검색 실행 >> 조건: ${type}, 검색어: ${query}`);
        // 실제로는 이 정보를 바탕으로 백엔드 API를 호출합니다.
        // 예시: fetchUsersAPI({ [type]: query });
        // 예를 들어 type이 'userId'이고 query가 'user123'이라면,
        // API 요청 URL은 `/api/admin/users?userId=user123` 형태가 될 것입니다.
    };

    return (
        <View style={styles.safeArea}>
            <SearchBox
                options={studentSearchOptions}
                onSearch={handleTeacherSearch}
            />

            <View style={styles.teacherContainer}>
                {/* 선생님 목록 렌더링 */}
            </View>

            <Pagination
                currentPage={currentPage}
                totalItems={totalTeachers}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={(page) => setCurrentPage(page)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    /* title: {
        fontSize: 18,
        fontWeight: '400',
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#dee2e6',
        marginBottom: 16,
    }, */
    bottomLine: {
        borderStyle: 'solid',
        borderColor: '#ddd',
    },
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    teacherContainer: {
        flex: 1,
        padding: 16,
        paddingTop: Platform.OS === 'android' ? 10 : 0,
    },
});

export default TeacherList;