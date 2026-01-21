package com.englishapp.api_server.dto.response;

import com.englishapp.api_server.entity.Announcement;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;

@Getter
@Builder
public class AnnouncementListResponse {

    private Long announcementId;
    private String title;
    private String authorName;
    private int viewCount;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yy-MM-dd'T'HH:mm:ssXXX", timezone = "UTC")
    private OffsetDateTime createdAt;

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
