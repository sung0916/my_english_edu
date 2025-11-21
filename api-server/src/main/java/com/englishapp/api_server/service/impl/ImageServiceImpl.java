package com.englishapp.api_server.service.impl;

import com.englishapp.api_server.domain.ImageStatus;
import com.englishapp.api_server.domain.ImageType;
import com.englishapp.api_server.dto.response.ImageResponse;
import com.englishapp.api_server.entity.Image;
import com.englishapp.api_server.repository.ImageRepository;
import com.englishapp.api_server.service.FileStorageService;
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
    private final FileStorageService fileStorageService;

    @Override
    @Transactional
    public List<ImageResponse> uploadImages(List<MultipartFile> files, ImageType type, Long relatedId) {

        return files.stream()
                .map(file -> uploadSingleFile(file, type, relatedId))
                .collect(Collectors.toList());
    }

    private ImageResponse uploadSingleFile(MultipartFile file, ImageType type, Long relatedId) {

        // 물리적 파일 저장은 FileStorageService에 위임
        // 이미지는 'images' 하위 폴더에 저장하도록 지정
        String storedFilePath = fileStorageService.storeFile(file, "images");

        // storedFilePath에서 순수 파일명(UUID 포함)만 추출
        // File.separator는 OS에 따라 다르므로 안전하게 "/"를 기준으로 마지막 부분을 가져옴
        String storedFileName = storedFilePath.substring(storedFilePath.lastIndexOf('/') + 1);

        Image image = Image.builder()
                .imageUrl(storedFilePath) // FileStorageService가 반환한 경로를 저장
                .fileName(storedFileName)
                .fileSize((int) file.getSize())
                .type(type)
                .relatedId(relatedId)
                .status(ImageStatus.PENDING)
                .build();

        Image savedImage = imageRepository.save(image);
        return ImageResponse.from(savedImage);
    }
}
