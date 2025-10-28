import { SearchOption } from "@/components/common/SearchBox";
import { Platform, StyleSheet, Text, View } from "react-native";

const StudentList = () => {
    const studentSearchOptions: SearchOption[] = [
        { value: 'userId', label: '아이디' },
        { value: 'userName', label: '회원명' },
    ];

    const handleStudentSearch = (type: string, query: string) => {
        console.log(`학생 검색 실행 >> 조건: ${type}, 검색어: ${query}`);
        // 실제로는 이 정보를 바탕으로 백엔드 API를 호출합니다.
        // 예시: fetchUsersAPI({ [type]: query });
        // 예를 들어 type이 'userId'이고 query가 'user123'이라면,
        // API 요청 URL은 `/api/admin/users?userId=user123` 형태가 될 것입니다.
    };

    return (
        <View style={styles.safeArea}>
            <Text style={styles.title}> 학생 목록 <hr style={styles.bottomLine} /></Text>

            <SearchBox
                options={studentSearchOptions}
                onSearch={handleStudentSearch}
            />

            <View style={styles.adminContainer}>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    title: {
        fontSize: 18,
        fontWeight: 400,
        paddingBottom: 20,
    },
    bottomLine: {
        borderStyle: 'solid',
        borderColor: '#ddd',
    },
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    adminContainer: {
        flex: 1,
        padding: 16,
        paddingTop: Platform.OS === 'android' ? 10 : 0,
    },
});

export default StudentList;