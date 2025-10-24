/* import { useState } from "react";
import { View } from "react-native";

export interface SearchOption {
    value: string;  // api요청 시 사용할 키
    label: string;  // 화면에 보여줄 이름
}

interface SearchBoxProps {
    options: SearchOption[];  // 페이지에서 사용할 검색 옵션
    onSearch: (searchType: string, searchQuery: string) => void;  // 검색 실행
}

// options가 없으면 렌더링X
const SearchBox: React.FC<SearchBoxProps> = ({options, onSearch}) => {
    if (!options || options.length === 0) {
        return null;
    }
}

// 선택된 조건과 검색어 관리
const [selectedType, setSelectedType] = useState<string>(options[0].value);
const [searchQuery, setSearchQuery] = useState('');

// 검색 버튼 실행 함수
const handleSearch = () => {
    // 부모 컴포넌트로부터 받은 onSearch 함수에 현재 선택된 타입과 검색어 전달
    onSearch(selectedType, searchQuery);
};

return (
    <View>

    </View>
); */