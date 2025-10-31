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

    // 공지사항 이미지 업로드
    @PostMapping("/announcement/{announcementId}")
    public ResponseEntity<List<ImageResponse>> uploadForAnnouncement(
            @PathVariable Long announcementId,
            @RequestParam("files") List<MultipartFile> files) {

        List<ImageResponse> uploadedImages = imageService.uploadImages(files, ImageType.ANNOUNCEMENT, announcementId);
        return ResponseEntity.status(HttpStatus.CREATED).body(uploadedImages);
    }
}