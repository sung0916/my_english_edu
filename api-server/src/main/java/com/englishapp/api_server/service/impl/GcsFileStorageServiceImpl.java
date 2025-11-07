package com.englishapp.api_server.service.impl;

import com.englishapp.api_server.service.FileStorageService;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@Profile("prod")  // prod 프로필일 때만 활성화
public class GcsFileStorageServiceImpl implements FileStorageService {

    // TODO: Google Cloud Storage 연동 로직 구현

    @Override
    public String storeFile(MultipartFile file, String subPath) {
        // 나중에 실제 GCS 업로드 로직 구현
        throw new UnsupportedOperationException("GCS 파일 저장이 아직 구현되지 않았습니다.");
    }

    @Override
    public String storeFile(byte[] data, String fileName, String subPath) {
        // 나중에 실제 GCS 업로드 로직 구현
        throw new UnsupportedOperationException("GCS 파일 저장이 아직 구현되지 않았습니다.");
    }
}
