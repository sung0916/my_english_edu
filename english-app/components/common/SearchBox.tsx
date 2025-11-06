import { Picker } from '@react-native-picker/picker';
import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import CustomButton from "./PermitButtonProps";

export interface SearchOption {
    value: string;  // api요청 시 사용할 키
    label: string;  // 화면에 보여줄 이름
}

interface SearchBoxProps {
    options: SearchOption[];  // 페이지에서 사용할 검색 옵션
    onSearch: (searchType: string, searchQuery: string) => void;  // 검색 실행
    defaultOption?: SearchOption;
}

// options가 없으면 렌더링X
export const SearchBox = ({ options, onSearch, defaultOption }: SearchBoxProps) => {
    if (!options || options.length === 0) {
        return null;
    }

    // 선택된 조건과 검색어 관리
    const [selectedType, setSelectedType] = useState<string>(
        defaultOption ? defaultOption.value : options[0].value);
    const [searchQuery, setSearchQuery] = useState('');

    // 검색 버튼 실행 함수
    const handleSearch = () => {
        // 부모 컴포넌트로부터 받은 onSearch 함수에 현재 선택된 타입과 검색어 전달
        onSearch(selectedType, searchQuery);
    };

    return (
        <View style={styles.searchBoxContainer}>
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={selectedType}
                    onValueChange={(itemValue) => {
                        setSelectedType(itemValue);
                        setSearchQuery('');
                    }}
                >
                    {options.map((option) => (
                        <Picker.Item key={option.value} label={option.label} value={option.value} />
                    ))}
                </Picker>
            </View>

            <TextInput
                style={styles.input}
                placeholder="검색어를 입력하세요"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch} // 엔터 키로도 검색 실행
            />

            <CustomButton title="검색" onPress={handleSearch} />
        </View>
    );
}

const styles = StyleSheet.create({
    searchBoxContainer: {
        flexDirection: 'row',
        padding: 3,
        margin: 3,
        justifyContent: 'space-around',
        // borderBottomWidth: 1,
        // borderColor: '#ddd',
        // borderRadius: 10,
        // alignItems: 'center',
    },
    pickerContainer: {
        flex: 0.15, // 드롭다운이 차지할 너비 비율
        height: 50,
        justifyContent: 'center',
    },
    input: {
        flex: 0.6, // 입력창이 차지할 너비 비율
        height: 50,
        paddingHorizontal: 10,
        fontSize: 16,
        borderWidth: 2,
        borderColor: '#ddd',
        borderRadius: 10,
    },
});

export default SearchBox;