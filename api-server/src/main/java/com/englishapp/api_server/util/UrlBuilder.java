package com.englishapp.api_server.util;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component  // Spring Bean으로 등록하여 @Value를 사용할 수 있도록 설정
public class UrlBuilder {

    // application.yml의 값 주입
    @Value("${app.base-url}")
    private String baseUrlValue;

    // static 변수에 주입받은 값을 저장
    private static String BASE_URL;

    // 의존성 주입 후 static 변수를 초기화하는 메서드
    @PostConstruct
    public void init() {
        BASE_URL = this.baseUrlValue;
    }

    /**
     * DB에 저장된 이미지 상대 경로를 완전한 URL로 변환
     *
     * @param dbPath DB에 저장된 경로 (예: "images/파일명.jpg")
     * @return 완전한 URL (예: "http://localhost:8080/api/images/파일명.jpg")
     */
    public static String buildImageUrl(String dbPath) {
        if (dbPath == null || dbPath.isBlank()) {
            return null;
        }

        return BASE_URL + "/api/" + dbPath;
    }

    /**
     * DB에 저장된 오디오 상대 경로를 완전한 URL로 변환
     *
     * @param dbPath DB에 저장된 경로 (예: "audios/파일명.mp3")
     * @return 완전한 URL (예: "http://localhost:8080/api/audios/파일명.mp3")
     */
    public static String buildAudioUrl(String dbPath) {
        if (dbPath == null || dbPath.isBlank()) {
            return null;
        }

        return BASE_URL + "/api/" + dbPath;
    }
}
