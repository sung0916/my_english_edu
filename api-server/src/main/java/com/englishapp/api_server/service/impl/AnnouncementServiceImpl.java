package com.englishapp.api_server.service.impl;

import com.englishapp.api_server.domain.BoardStatus;
import com.englishapp.api_server.domain.ImageStatus;
import com.englishapp.api_server.domain.ImageType;
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

        // 요청에 포함된 imageIds 리스트를 사용하여 이미지들의 상태를 ACTIVE로 변경 후 연관관계 설정
        if (request.getImageIds() != null && !request.getImageIds().isEmpty()) {

            List<Image> imagesToActivate = imageRepository.findAllById(request.getImageIds());
            for (Image image : imagesToActivate) {

                // PENDING 상태인 이미지만 활성화(보안)
                if (image.getStatus() == ImageStatus.PENDING) {
                    image.activate(ImageType.ANNOUNCEMENT, savedAnnouncement.getId());
                }
            }
        }

        // 연관된 활성 이미지를 조회하여 최종 Response DTO 생성
        List<Image> relatedImages = imageRepository.findByTypeAndRelatedIdAndStatus(
                ImageType.ANNOUNCEMENT,
                savedAnnouncement.getId(),
                ImageStatus.ACTIVE);

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

        List<Image> images = imageRepository.findByTypeAndRelatedIdAndStatus(
                ImageType.ANNOUNCEMENT, id, ImageStatus.ACTIVE);

        return AnnouncementResponse.from(announcement, images);
    }

    // 공지사항 수정
    @Override
    @Transactional
    public AnnouncementResponse update(Long id, AnnouncementRequest request, User user) {

        // 공지사항 조회
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("해당 ID의 공지사항 조회 불가 : " + id));

        // 권한 확인
        if (!announcement.getUser().getId().equals(user.getId())) {
            // throw new AccessDeniedException("수정 권한이 없습니다.");
            // 예외 처리 방식은 전역 예외 핸들러와 상의하여 결정
        }

        // 3. 내용 업데이트 (Dirty Checking)
        announcement.update(request.getTitle(), request.getContent());

        // 4. 기존에 연결된 ACTIVE 이미지들을 모두 PENDING으로 변경 (일단 연결 해제)
        List<Image> existingImages = imageRepository.findByTypeAndRelatedIdAndStatus(
                ImageType.ANNOUNCEMENT, id, ImageStatus.ACTIVE);
        existingImages.forEach(Image::deactivate);

        // 5. 이미지 관계 업데이트 (기존 이미지 비활성화, 새 이미지 활성화)
        // (이 로직은 요구사항에 따라 복잡해질 수 있습니다. 여기서는 새 이미지를 활성화하는 로직만 추가합니다)
        if (request.getImageIds() != null && !request.getImageIds().isEmpty()) {
            List<Image> newImages = imageRepository.findAllById(request.getImageIds());

            newImages.forEach(image -> {
                if (image.getStatus() == ImageStatus.PENDING) {
                    image.activate(ImageType.ANNOUNCEMENT, announcement.getId());

                }
            });
        }

        // 6. 연관된 최신 이미지 목록을 다시 불러와서 DTO로 변환 후 반환
        List<Image> updatedImages = imageRepository.findByTypeAndRelatedIdAndStatus(
                ImageType.ANNOUNCEMENT,
                id,
                ImageStatus.ACTIVE);

        return AnnouncementResponse.from(announcement, updatedImages);
    }

    // 공지사항 삭제
    @Override
    @Transactional
    public void delete(Long id, User user) {

        // 1. 기존 공지사항 조회
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("해당 ID의 공지사항을 찾을 수 없습니다: " + id));

        // 2. 권한 확인
        if (!announcement.getUser().getId().equals(user.getId())) {
            // throw new AccessDeniedException("삭제 권한이 없습니다.");
        }

        // 3. 상태를 DELETED로 변경 (Soft Delete)
        announcement.setStatus(BoardStatus.DELETED);

        // 4. 연관된 이미지들도 비활성화 처리
        List<Image> relatedImages = imageRepository.findByTypeAndRelatedIdAndStatus(
                ImageType.ANNOUNCEMENT, id, ImageStatus.ACTIVE);

        relatedImages.forEach(Image::deactivate);
    }
}
