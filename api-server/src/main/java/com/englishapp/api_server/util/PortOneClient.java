package com.englishapp.api_server.util;

import com.englishapp.api_server.dto.response.PortOneDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class PortOneClient {

    @Value("${portone.api-key:}")
    private String apiKey;

    @Value("${portone.api-secret:}")
    private String apiSecret;

    // 포트원 구버전 API (V2 SDK를 써도 검증은 안정적인 V1으로 사용)
    private final RestClient restClient = RestClient.create("https://api.iamport.kr");

    // 1. 관리자 토큰 발급 (API 호출 권한 획득)
    public String getAccessToken() {
        Map<String, String> body = Map.of(
                "imp_key", apiKey,
                "imp_secret", apiSecret
        );

        try {
            PortOneDto.TokenResponse result = restClient.post()
                    .uri("/users/getToken")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(PortOneDto.TokenResponse.class);

            if (result == null || result.getResponse() == null) {
                throw new RuntimeException("포트원 토큰 발급 실패");
            }
            return result.getResponse().getAccess_token();

        } catch (Exception e) {
            log.error("포트원 토큰 발급 실패: {}", e.getMessage());
            throw new RuntimeException("결제 서버 연동 중 오류 발생");
        }
    }

    // 2. 결제 단건 조회 (검증용)
    public PortOneDto.PaymentResponse getPaymentInfo(String impUid, String accessToken) {
        try {
            return restClient.get()
                    .uri("/payments/" + impUid)
                    .header("Authorization", accessToken)
                    .retrieve()
                    .body(PortOneDto.PaymentResponse.class);

        } catch (Exception e) {
            log.error("포트원 결제 조회 실패: impUid={}, error={}", impUid, e.getMessage());
            throw new RuntimeException("결제 검증 중 오류 발생");
        }
    }
}
