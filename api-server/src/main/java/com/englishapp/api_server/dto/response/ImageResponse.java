package com.englishapp.api_server.dto.response;

import com.englishapp.api_server.entity.Image;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ImageResponse {

    private Long imageId;
    private String imageUrl;
    private String fileName;
    private int fileSize;
    private int sortOrder;

    // 정적 팩토리 메서드: Entity -> DTO 변환
    public static ImageResponse from(Image image) {
        return ImageResponse.builder()
                .imageId(image.getId())
                .imageUrl(image.getImageUrl())
                .fileName(image.getFileName())
                .fileSize(image.getFileSize())
                .sortOrder(image.getSortOrder())
                .build();
    }
}