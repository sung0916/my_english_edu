package com.englishapp.api_server.dto.response;

import com.englishapp.api_server.entity.Announcement;
import com.englishapp.api_server.entity.Image;
import com.englishapp.api_server.entity.User;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
public class AnnouncementResponse {

    private Long announcementId;
    private String title;
    private String content;
    private int viewCount;
    private AuthorResponse author;  // 작성자(중첩 DTO)
    private List<ImageResponse> images;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yy-MM-dd'T'HH:mm:ssXXX", timezone = "UTC")
    private OffsetDateTime createdAt;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yy-MM-dd'T'HH:mm:ssXXX", timezone = "UTC")
    private OffsetDateTime updatedAt;

    // Entity -> DTO 변환을 위한 정적 팩토리 메서드
    public static AnnouncementResponse from(Announcement announcement, List<Image> images) {
        return AnnouncementResponse.builder()
                .announcementId(announcement.getId())
                .title(announcement.getTitle())
                .content(announcement.getContent())
                .viewCount(announcement.getViewCount())
                .author(AuthorResponse.from(announcement.getUser()))
                .images(images != null ? images.stream()
                        .map(ImageResponse::from)
                        .collect(Collectors.toList()) : new ArrayList<>())
                .createdAt(announcement.getCreatedAt())
                .updatedAt(announcement.getUpdatedAt())
                .build();
    }

    // 작성자 정보만을 위한 내부 DTO
    @Getter
    @Builder
    public static class AuthorResponse {
        private Long userId;
        private String username;

        private static AuthorResponse from(User user) {
            return AuthorResponse.builder()
                    .userId(user.getId())
                    .username(user.getUsername())
                    .build();
        }
    }
}
