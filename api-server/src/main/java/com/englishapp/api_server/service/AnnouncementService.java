package com.englishapp.api_server.service;

import com.englishapp.api_server.dto.request.AnnouncementRequest;
import com.englishapp.api_server.dto.response.AnnouncementListResponse;
import com.englishapp.api_server.dto.response.AnnouncementResponse;
import com.englishapp.api_server.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AnnouncementService {

    // 공지사항 등록
    AnnouncementResponse create(AnnouncementRequest request, User user);

    // 공지사항 수정
    AnnouncementResponse update(Long id, AnnouncementRequest request, User user);

    // 공지사항 삭제
    void delete(Long id, User user);

    // 공지사항 목록
    Page<AnnouncementListResponse> findAll(Pageable pageable);

    // 공지사항 상세 보기
    AnnouncementResponse findById(Long id);
}
