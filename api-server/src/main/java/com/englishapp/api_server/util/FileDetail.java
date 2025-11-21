package com.englishapp.api_server.util;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class FileDetail {

    private String storedPath;        // 예: "images/uuid-파일명.jpg"
    private String storedFileName;    // 예: "uuid-파일명.jpg"
    private String originalFileName;  // 예: "파일명.jpg"
}
