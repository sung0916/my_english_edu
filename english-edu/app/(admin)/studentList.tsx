import SearchComponent, { SearchFilter } from "@/components/common/SearchComponent";
import { Platform, StyleSheet, Text, View } from "react-native";

const StudentList = () => {
    const studentSearchFilters: SearchFilter[] = [
        {key: 'userId', label: '아이디', type: 'text'},
        {key: 'username', label: '회원명', type: 'text'}
    ];

    const handleStudentSearch = (criteria: Record<string, any>) => {
        console.log('학생 검색 조건 : ', criteria);
    };

    return (
        <View style = {styles.safeArea}>
            <Text style={styles.title}> 학생 목록 <hr style={styles.bottomLine}/></Text>

            <SearchComponent
                filters={studentSearchFilters}
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