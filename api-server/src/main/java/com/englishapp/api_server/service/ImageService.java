package com.englishapp.api_server.service;

import com.englishapp.api_server.domain.ImageType;
import com.englishapp.api_server.dto.response.ImageResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ImageService {

    // 이미지 업로드
    List<ImageResponse> uploadImages(List<MultipartFile> files, ImageType imageType, Long relatedId);
}
