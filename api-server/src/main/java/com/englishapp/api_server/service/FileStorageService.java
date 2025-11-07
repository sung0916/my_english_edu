package com.englishapp.api_server.service;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {

    /**
     * MultipartFile을 저장하고, 접근 가능한 URL 또는 경로를 반환
     * @param file    사용자로부터 반은 파일
     * @param subPath "images", "words" 등 파일을 저장할 하위 경로
     * @return 저장된 파일의 접근 경로
     **/
    String storeFile(MultipartFile file, String subPath);

    /**
     * byte 배열 데이터를 파일로 저장하고, 접근 가능한 URL 또는 경로를 반환
     *
     * @param data     오디오 데이터 등 바이트 배열
     * @param fileName 저장할 파일 이름(예: "1.mp3")
     * @param subPath  "sentences", "words" 등 파일을 저장할 하위 경로
     * @return 저장된 파일의 접근 경로
     **/
    String storeFile(byte[] data, String fileName, String subPath);
}
