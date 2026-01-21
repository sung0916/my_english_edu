package com.englishapp.api_server.service.impl;

import com.englishapp.api_server.domain.BoardStatus;
import com.englishapp.api_server.domain.ImageStatus;
import com.englishapp.api_server.domain.ImageType;
import com.englishapp.api_server.domain.UserRole;
import com.englishapp.api_server.dto.request.AnnouncementRequest;
import com.englishapp.api_server.dto.response.AnnouncementListResponse;
import com.englishapp.api_server.dto.response.AnnouncementResponse;
import com.englishapp.api_server.entity.Announcement;
import com.englishapp.api_server.entity.Image;
import com.englishapp.api_server.entity.User;
import com.englishapp.api_server.repository.AnnouncementRepository;
import com.englishapp.api_server.repository.ImageRepository;
import com.englishapp.api_server.service.AnnouncementService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AnnouncementServiceImpl implements AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final ImageRepository imageRepository;

    // 공지사항 등록
    @Override
    @Transactional
    public AnnouncementResponse create(AnnouncementRequest request, User user) {

        // DTO를 Entity로 변환
        Announcement announcement = request.toEntity(user);

        // DB에 저장
        Announcement savedAnnouncement = announcementRepository.save(announcement);

        connectImages(request.getImageIds(), savedAnnouncement);

        // 연관된 활성 이미지를 조회하여 최종 Response DTO 생성
        List<Image> relatedImages = getActiveImages(savedAnnouncement.getId());

        return AnnouncementResponse.from(savedAnnouncement, relatedImages);
    }

    // 공지사항 목록 (+ 검색했을 때 파라미터 추가)
    @Override
    @Transactional(readOnly = true) // 데이터 변경이 없는 조회는 readOnly로 성능 최적화
    public Page<AnnouncementListResponse> findAll(Pageable pageable, String searchType, String searchKeyword) {

        // DELETED 상태가 아닌 공지사항만 조회
        Page<Announcement> announcements;

        // 1. 검색어가 없는 경우 (전체 조회)
        if (searchKeyword == null || searchKeyword.trim().isEmpty()) {
            announcements = announcementRepository.findByStatusNot(BoardStatus.DELETED, pageable);
        }
        // 2. 검색어가 있는 경우 -> 타입 별 조회
        else {
            // 제목 검색
            if ("title".equals(searchType)) {
                announcements = announcementRepository.findByTitleContainingAndStatusNot(searchKeyword, BoardStatus.DELETED, pageable);
            }
            // 내용 검색
            else if ("content".equals(searchType)) {
                announcements = announcementRepository.findByContentContainingAndStatusNot(searchKeyword, BoardStatus.DELETED, pageable);
            }
            // 타입이 이상하면 기본 전체 조회 (또는 예외처리)
            else {
                announcements = announcementRepository.findByContentContainingAndStatusNot(searchKeyword, BoardStatus.DELETED, pageable);
            }
        }

        // DTO 변환 반환
        return announcements.map(AnnouncementListResponse::from);
    }

    // 공지사항 상세 보기
    @Override
    @Transactional  // 조회수 증가를 위해 사용
    public AnnouncementResponse findById(Long id) {

        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("해당 ID의 공지를 찾을 수 없습니다. " + id));

        // 조회수 증가(Dirty Checking)
        announcement.increaseViewCount();

        List<Image> images = getActiveImages(id);

        return AnnouncementResponse.from(announcement, images);
    }

    // 공지사항 수정
    @Override
    @Transactional
    public AnnouncementResponse update(Long id, AnnouncementRequest request, UserDetailsImpl userDetails) {

        // 공지사항 조회
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("해당 ID의 공지사항 조회 불가 : " + id));

        // 권한 확인
        validateOwner(announcement, userDetails);

        // 내용 업데이트 (Dirty Checking)
        announcement.update(request.getTitle(), request.getContent());

        // 기존에 연결된 ACTIVE 이미지들을 모두 PENDING으로 변경 (일단 연결 해제)
        List<Image> existingImages = getActiveImages(id);
        for (Image img : existingImages) {
            img.deactivate();
        }

        // 이미지들 다시 연결
        connectImages(request.getImageIds(), announcement);

        // 최신 상태 조회
        List<Image> updatedImages = getActiveImages(id);
        return AnnouncementResponse.from(announcement, updatedImages);
    }

    // 공지사항 삭제
    @Override
    @Transactional
    public void delete(Long id, UserDetailsImpl userDetails) {

        // 1. 기존 공지사항 조회
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("해당 ID의 공지사항을 찾을 수 없습니다: " + id));

        // 2. 권한 확인
        validateOwner(announcement, userDetails);

        // 3. 상태를 DELETED로 변경 (Soft Delete)
        announcement.setStatus(BoardStatus.DELETED);

        // 4. 연관된 이미지들도 비활성화 처리
        List<Image> relatedImages = getActiveImages(id);

        relatedImages.forEach(Image::deactivate);
    }

    // ===== 헬퍼 메서드 =====

    private void validateOwner(Announcement announcement, UserDetailsImpl userDetails) {

        if (userDetails == null) {
            throw new IllegalStateException("로그인 정보 없음. 재로그인 필요");
        }

        if (!announcement.getUser().getId().equals(userDetails.getUserId()) && userDetails.getUser().getRole() != UserRole.ADMIN) {
            throw new AccessDeniedException("작성자만 수정/삭제할 수 있습니다.");
        }
    }

    private void connectImages(List<Long> imageIds, Announcement announcement) {

        if (imageIds != null && !imageIds.isEmpty()) {
            List<Image> images = imageRepository.findAllById(imageIds);
            for (Image image : images) {
                image.activate(ImageType.ANNOUNCEMENT, announcement.getId());
            }
        }
    }

    private List<Image> getActiveImages(Long relatedId) {

        return imageRepository.findByTypeAndRelatedIdAndStatus(
            ImageType.ANNOUNCEMENT, relatedId, ImageStatus.ACTIVE);
    }
}
