import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

export interface SearchFilter {
    key: string;
    label: string;
    type: 'text' | 'select';
    options?: string[];
}

interface SearchComponentProps {
    filters: SearchFilter[];
    onSearch: (searchCriteria: Record<string, any>) => void;
}

const SearchComponent : React.FC<SearchComponentProps> = ({filters, onSearch}) => {
    // 입력값 관리
    const [searchValues, setSearchValues] = useState<Record<string, any>>({});

    // 입력값 변경 핸들러
    const handleInputChange = (key: string, value: string) => {
        setSearchValues(prev => ({...prev, [key]: value}));
    };

    // 검색 버튼 클릭 핸들러
    const handleSearch = () => {
        onSearch(searchValues);
    };

    return (
        <View style={styles.searchContainer}>
            {filters.map(filter => (
                <View key={filter.key} style={styles.filterItem}>
                    <Text style={styles.label}>{filter.label}</Text>

                    {filter.type === 'text' && (
                        <TextInput
                            style={styles.input}
                            placeholder={`${filter.label} 입력`}
                            onChangeText={text => handleInputChange(filter.key, text)}
                            value={searchValues[filter.key] || ''}
                        />
                    )}
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    searchContainer: {

    },
    filterItem: {

    },
    label: {

    },
    input: {

    },
});

export default SearchComponent;