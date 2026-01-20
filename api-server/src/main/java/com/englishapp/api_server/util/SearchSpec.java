package com.englishapp.api_server.util;

import org.springframework.data.jpa.domain.Specification;

public class SearchSpec {
    // 어떤 엔티티(T)든 "title"이나 "content" 같은 필드 이름만 주면 검색 쿼리를 만들어주는 함수
    public static <T> Specification<T> like(String fieldName, String keyword) {
        return (root, query, builder) ->
                builder.like(root.get(fieldName), "%" + keyword + "%");
    }

    // status가 특정 값이 아닌 것 검색 (예: DELETED가 아닌 것)
    public static <T> Specification<T> notStatus(String statusField, Enum<?> statusValue) {
        return (root, query, builder) ->
                builder.notEqual(root.get(statusField), statusValue);
    }
}
