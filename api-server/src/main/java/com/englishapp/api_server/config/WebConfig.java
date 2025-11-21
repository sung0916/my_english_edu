package com.englishapp.api_server.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    // application.yml에 설정한 업로드 경로 주입
    @Value("${file.upload-dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        // 이미지 파일 경로 설정
        String imageResourcePath = "file:///" + uploadDir + "/images";
        registry.addResourceHandler("/api/images/**")
                // "/images/**"의 URL 패턴으로 요청이 오면 로컬 디스크의 경로에서 파일을 찾아 제공
                .addResourceLocations(imageResourcePath);

        // 오디오 파일 경로 설정
        // String audioResourcePath = "file:///" + uploadDir + "/audios";
    }
}
