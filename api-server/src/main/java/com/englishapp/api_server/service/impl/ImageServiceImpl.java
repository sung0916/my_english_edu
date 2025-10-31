package com.englishapp.api_server.service.impl;

import com.englishapp.api_server.domain.ImageStatus;
import com.englishapp.api_server.domain.ImageType;
import com.englishapp.api_server.dto.response.ImageResponse;
import com.englishapp.api_server.entity.Image;
import com.englishapp.api_server.repository.ImageRepository;
import com.englishapp.api_server.service.ImageService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ImageServiceImpl implements ImageService {

    private final ImageRepository imageRepository;

    // application.yml 또는 properties 파일에서 경로를 주입받는 것이 더 유연합니다.
    @Value("${file.upload-dir}")
    private String uploadDir;

    private Path uploadPath;

    // 서비스가 초기화될 때 업로드 경로를 확인하고 없으면 생성
    @PostConstruct
    public void init() {

        try {
            uploadPath = Paths.get(uploadDir);
            Files.createDirectories(uploadPath);
            log.info("업로드 디렉토리 생성/확인 완료 : {}", uploadPath);
        } catch (IOException e) {
            log.error("업로드 디렉토리를 생성할 수 없습니다.", e);
            throw new RuntimeException("Could not initialize upload directory!", e);
        }
    }

    @Override
    @Transactional
    public List<ImageResponse> uploadImages(List<MultipartFile> files, ImageType imageType, Long relatedId) {

        return files.stream()
                .map(file -> uploadSingleFile(file, imageType, relatedId))
                .collect(Collectors.toList());
    }

    private ImageResponse uploadSingleFile(MultipartFile file, ImageType imageType, Long relatedId) {

        if (file.isEmpty()) {
            throw new IllegalArgumentException("업로드할 파일이 비어있습니다.");
        }

        try {
            // 파일 이름 중복 방지를 위한 UUID
            String originalFileName = file.getOriginalFilename();
            String storedFileName = UUID.randomUUID().toString() + "_" + originalFileName;
            Path filePath = this.uploadPath.resolve(storedFileName);

            // 물리적 파일 저장
            Files.copy(file.getInputStream(), filePath);

            Image image = Image.builder()
                    .imageUrl(filePath.toString())
                    .fileName(originalFileName)
                    .fileSize((int) file.getSize())
                    .type(imageType)
                    .relatedId(relatedId)
                    .status(ImageStatus.PENDING)
                    .build();

            Image savedImage = imageRepository.save(image);

            log.info("파일 업로드 성공 : {}", originalFileName);

            return ImageResponse.from(savedImage);
        } catch (IOException e) {
            log.error("파일 저장 실패: {}", file.getOriginalFilename());

            throw new RuntimeException("파일 저장에 실패했습니다: " + file.getOriginalFilename(), e);
        }
    }
}