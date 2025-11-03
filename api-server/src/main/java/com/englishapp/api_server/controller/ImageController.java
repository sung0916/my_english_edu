package com.englishapp.api_server.controller;

import com.englishapp.api_server.domain.ImageType;
import com.englishapp.api_server.dto.response.ImageResponse;
import com.englishapp.api_server.service.ImageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("api/images")
@Slf4j
@RequiredArgsConstructor
public class ImageController {

    private final ImageService imageService;

    // 특정 엔티티에 종속되지 않는 범용 이미지 업로드 API
    @PostMapping("/upload")
    public ResponseEntity<List<ImageResponse>> uploadImages(
            @RequestParam("files") List<MultipartFile> files) {

        List<ImageResponse> uploadedImages = imageService.uploadImages(files, null, null);
        return ResponseEntity.status(HttpStatus.CREATED).body(uploadedImages);
    }
}
