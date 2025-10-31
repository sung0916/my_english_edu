package com.englishapp.api_server.dto.request;

import lombok.Getter;

import java.util.List;

@Getter
public class ImageRequest {

    private String title;
    private String content;
    
    // 해당 글(공지사항, 게임 등)에 포함될 이미지들의 ID목록
    private List<Long> imageIds;
}