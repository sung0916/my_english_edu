package com.englishapp.api_server.dto.request;

import com.englishapp.api_server.entity.Announcement;
import com.englishapp.api_server.entity.User;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter  // Controller에서 JSON -> Object 매핑을 위해 필요
public class AnnouncementRequest {

    private String title;
    private String content;
    private List<Long> imageIds;

    public Announcement toEntity(User author) {
        return Announcement.builder()
                .title(this.title)
                .content(this.content)
                .user(author)
                .build();
    }
}
