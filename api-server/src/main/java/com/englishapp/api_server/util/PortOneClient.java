package com.englishapp.api_server.util;

import com.englishapp.api_server.dto.response.PortOneDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
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

    // 포트원 V2 API
    private final RestClient restClient = RestClient.create("https://api.portone.io");

    // 1. 관리자 토큰 발급 (V2)
    public String getAccessToken() {
        log.info("DEBUG: PortOne V2 API Secret 사용");

        Map<String, String> body = Map.of(
                "apiSecret", apiSecret
        );

        try {
            PortOneDto.V2TokenResponse result = restClient.post()
                    .uri("/login/api-secret")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(PortOneDto.V2TokenResponse.class);

            if (result == null || result.getAccessToken() == null) {
                throw new RuntimeException("포트원 V2 토큰 발급 실패");
            }
            return result.getAccessToken();

        } catch (Exception e) {
            log.error("포트원 V2 토큰 발급 실패: {}", e.getMessage());
            throw new RuntimeException("결제 서버 연동 중 오류 발생 (V2 Login)");
        }
    }

    // 2. 결제 단건 조회 (V2 - paymentId 또는 txId로 조회)
    // 여기서 paymentId는 PortOne의 Transaction ID(txId)를 의미한다고 가정
    public PortOneDto.PaymentResponse getPaymentInfo(String paymentId, String accessToken) {
        try {
            PortOneDto.V2PaymentResponse v2Response = restClient.get()
                    .uri("/payments/" + paymentId)
                    .header("Authorization", "Bearer " + accessToken)
                    .retrieve()
                    .body(PortOneDto.V2PaymentResponse.class);

            if (v2Response == null) {
                throw new RuntimeException("V2 결제 응답 없음");
            }

            // V2 응답을 기존 V1 DTO로 매핑하여 서비스 계층 영향 최소화
            PortOneDto.PaymentResponse wrapper = new PortOneDto.PaymentResponse();
            PortOneDto.PaymentResponse.Response inner = new PortOneDto.PaymentResponse.Response();

            return mapV2ToV1(v2Response);

        } catch (HttpClientErrorException e) {
            log.error("포트원 API 오류 응답: status={}, body={}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("포트원 연동 오류: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("포트원 V2 결제 조회 실패: paymentId={}, error={}", paymentId, e.getMessage());
            throw new RuntimeException("결제 검증 중 오류 발생 (V2 Lookup)");
        }
    }

    private PortOneDto.PaymentResponse mapV2ToV1(PortOneDto.V2PaymentResponse v2) {
        PortOneDto.PaymentResponse.Response inner = PortOneDto.PaymentResponse.Response.builder()
                .imp_uid(v2.getTransactionId()) // txId -> imp_uid
                .merchant_uid(v2.getId())       // paymentId -> merchant_uid (Note: paymentId in V2 is usually the Order ID provided by merchant)
                .amount((int) v2.getAmount().getTotal())
                .status(v2.getStatus().toLowerCase()) // PAID -> paid
                .pay_method("card") // V2 usually abstracts this, defaulting to card or assuming from context for now
                .pg_provider("html5_inicis") // Defaulting as checking implementation details is complex in V2
                .build();

        return PortOneDto.PaymentResponse.builder()
                .code(0)
                .message(null)
                .response(inner)
                .build();
    }

    // 결제 취소 요청
    public void cancelPayment(String paymentId, String reason, String accessToken) {

        try {
            Map<String, String> body = Map.of("reason", reason);

            restClient.post()
                    .uri("/payments/" + paymentId + "/cancel")
                    .header("Authorization", "Bearer" + accessToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .toBodilessEntity();  // 응답 본문 필요 없음

            log.info("포트원 결제 취소 성공: paymentId={}", paymentId);

        } catch (HttpClientErrorException e) {
            log.error("포트원 취소 실패: status={}, body={}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("결제 취소 연동 실패: " + e.getResponseBodyAsString());

        } catch (Exception e) {
            log.error("포트원 취소 중 알 수 없는 오류: {}", e.getMessage());
            throw new RuntimeException("결제 취소 중 오류 발생");
        }
    }
}
