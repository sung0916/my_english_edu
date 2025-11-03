package com.englishapp.api_server.dto.response;

import com.englishapp.api_server.entity.Announcement;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AnnouncementListResponse {

    private Long announcementId;
    private String title;
    private String authorName;
    private int viewCount;
    private LocalDateTime createdAt;

    public static AnnouncementListResponse from(Announcement announcement) {

        return AnnouncementListResponse.builder()
                .announcementId(announcement.getId())
                .title(announcement.getTitle())
                .authorName(announcement.getUser().getUsername())
                .viewCount(announcement.getViewCount())
                .createdAt(announcement.getCreatedAt())
                .build();
    }
}
