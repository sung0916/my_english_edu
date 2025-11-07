package com.englishapp.api_server.service.impl;

import com.englishapp.api_server.service.FileStorageService;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@Profile("local")  // local 프로필일 때만 활성화 - 개발용
@Slf4j
public class LocalFileStorageServiceImpl implements FileStorageService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    private Path rootLocation;

    @PostConstruct
    public void init() {

        try {
            rootLocation = Paths.get(uploadDir);
            Files.createDirectories(rootLocation);
            log.info("파일 스토리지 루트 디렉토리 생성/확인 완료 : {}", rootLocation.toAbsolutePath());

        } catch (IOException e) {
            log.error("파일 스토리지 루트 디렉토리 초기화 실패", e);
            throw new RuntimeException("Could not initialize storage location", e);
        }
    }

    @Override
    public String storeFile(MultipartFile file, String subPath) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("업로드할 파일이 비어있음");
        }

        try {
            String originalFileName = file.getOriginalFilename();
            String storedFileName = UUID.randomUUID().toString() + "-" + originalFileName;

            // subPath 경로 생성 (예: uploads/images)
            Path destinationPath = createSubPath(subPath);

            Path destinationFile =
                    destinationPath.resolve(Paths.get(storedFileName)).normalize().toAbsolutePath();

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
            }

            log.info("[{}] 파일 저장 성공: {}", subPath, originalFileName);

            // DB에 저장할 상대 경로 반환 (예: /uploads/images/uuid_image.jpg)
            // 실제 서비스 시에는 도메인을 포함한 전체 URL을 반환하도록 구성
            return Paths.get(subPath).resolve(storedFileName).toString().replace("\\", "/");

        } catch (IOException e) {
            log.error("파일 저장 실패: {}", file.getOriginalFilename(), e);
            throw new RuntimeException("Failed to store file.", e);
        }
    }

    @Override
    public String storeFile(byte[] data, String fileName, String subPath) {

        try {
            Path destinationPath = createSubPath(subPath);
            Path destinationFile = destinationPath.resolve(Paths.get(fileName)).normalize().toAbsolutePath();

            Files.write(destinationFile, data);
            log.info("[{}] 데이터 파일 저장 성공: {}", subPath, fileName);

            return Paths.get(subPath).resolve(fileName).toString().replace("\\", "/");

        } catch (IOException e) {
            log.error("데이터 파일 저장 실패: {}", fileName, e);
            throw new RuntimeException("Failed to store file", e);
        }
    }

    private Path createSubPath(String subPath) throws IOException {

        Path destinationPath = rootLocation.resolve(subPath);

        if (!Files.exists(destinationPath)) {
            Files.createDirectories(destinationPath);
        }

        return destinationPath;
    }
}
