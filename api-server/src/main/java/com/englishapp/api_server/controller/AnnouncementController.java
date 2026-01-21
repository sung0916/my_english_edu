package com.englishapp.api_server.controller;

import com.englishapp.api_server.dto.request.AnnouncementRequest;
import com.englishapp.api_server.dto.response.AnnouncementListResponse;
import com.englishapp.api_server.dto.response.AnnouncementResponse;
import com.englishapp.api_server.entity.User;
import com.englishapp.api_server.service.AnnouncementService;
import com.englishapp.api_server.service.impl.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/announcements")
@RequiredArgsConstructor
@Slf4j
public class AnnouncementController {

    private final AnnouncementService announcementService;

    // 공지사항 등록
    @PostMapping("/write")
    public ResponseEntity<AnnouncementResponse> createAnnouncement(
            @RequestBody AnnouncementRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails
            ) {

        User user = userDetails.getUser();

        AnnouncementResponse response = announcementService.create(request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // 공지사항 목록
    @GetMapping("/list")
    public ResponseEntity<Page<AnnouncementListResponse>> getAllAnnouncements(
            Pageable pageable,
            @RequestParam(required = false) String searchType,
            @RequestParam(required = false) String searchKeyword) {

        Page<AnnouncementListResponse> response = announcementService.findAll(pageable, searchType, searchKeyword);
        return ResponseEntity.ok(response);
    }

    // 공지사항 상세 보기
    @GetMapping("/{id}")
    public ResponseEntity<AnnouncementResponse> getAnnouncement(@PathVariable Long id) {

        AnnouncementResponse response = announcementService.findById(id);
        return ResponseEntity.ok(response);
    }

    // 공지사항 수정
    @PatchMapping("/{id}")
    public ResponseEntity<AnnouncementResponse> updateAnnouncement(
            @PathVariable Long id,
            @RequestBody AnnouncementRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        AnnouncementResponse response = announcementService.update(id, request, userDetails);
        return ResponseEntity.ok(response);
    }

    // 공지사항 삭제 (Soft Delete)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAnnouncement(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        announcementService.delete(id, userDetails);
        return ResponseEntity.noContent().build();
    }
}
