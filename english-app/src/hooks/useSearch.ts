import { useCallback, useState } from "react";

interface SearchState {
    type: string;
    keyword: string;
}

export const useSearch = (defaultType: string = 'title') => {
    // 1. 검색 상태 관리 (검색 카테고리, 검색 키워드)
    const [searchState, setSearchState] = useState<SearchState>({
        type: defaultType,
        keyword: '',
    });

    // 2. 검색 실행 핸들러 (searchBox의 onSearch에 전달할 함수)
    const onSearch = useCallback((type: string, keyword: string) => {
        setSearchState({ type, keyword });
        // 페이지네이션 초기화가 필요하다면 여기서 리턴값으로 플래그를 주거나,
        // 부모 컴포넌트의 useEffect 의존성에 searchState를 넣으면 됨.
    }, []);

    // 3. API 요청용 파라미터 생성
    const getSearchParams = useCallback(() => {
        if (!searchState.keyword) return {};
        return {
            searchType: searchState.type,
            searchKeyword: searchState.keyword
        };
    }, [searchState]);

    return {
        searchState,      // 현재 검색 상태 
        onSearch,         // SearchBox에 넘겨줄 함수
        getSearchParams   // API 호출 시 params에 spread할 함수
    };
};
