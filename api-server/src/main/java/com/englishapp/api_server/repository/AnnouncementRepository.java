package com.englishapp.api_server.repository;

import com.englishapp.api_server.domain.BoardStatus;
import com.englishapp.api_server.entity.Announcement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

    // 페이징 처리를 위한 쿼리 메서드
    Page<Announcement> findByStatusNot(BoardStatus boardStatus, Pageable pageable);
}
