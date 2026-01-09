package com.englishapp.api_server.dto.request;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

public class OrderRequest {

    @Getter
    @NoArgsConstructor
    public static class Create {

        // 장바구니에서 선택된 아이템들의 ID 목록
        private List<Long> cartIds;
    }
}
