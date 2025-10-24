package com.englishapp.api_server.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // 모든 경로에 대해 CORS 정책을 적용
                // 허용할 프론트엔드 서버의 출처 명시
                // Expo 포트 : 19006 또는 8081
                .allowedOrigins("http://localhost:8081", "http://localhost:19006")
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS") // 허용할 HTTP 메소드
                .allowedHeaders("*") // 모든 헤더를 허용
                .allowCredentials(true) // 쿠키/인증 정보를 허용
                .maxAge(3600); // pre-flight 요청의 캐시 시간(초)
    }
}