package com.englishapp.api_server.repository;

import com.englishapp.api_server.domain.BoardStatus;
import com.englishapp.api_server.entity.Announcement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

    // 페이징 처리를 위한 쿼리 메서드 (user 정보를 Fetch Join해서 N+1 방지)
    @EntityGraph(attributePaths = {"user"})
    Page<Announcement> findByStatusNot(BoardStatus boardStatus, Pageable pageable);

    /* @EntityGraph(attributePaths = {"user"})
    @Query("SELECT a FROM Announcement a WHERE a.status <> :status")
    Page<Announcement> findAllWithUserByStatusNot(@Param("status") BoardStatus status, Pageable pageable); */

    // 공지 목록 페이지 제목 검색
    @EntityGraph(attributePaths = {"user"})
    Page<Announcement> findByTitleContainingAndStatusNot(String title, BoardStatus status, Pageable pageable);

    // 공지 목록 페이지 내용 검색
    @EntityGraph(attributePaths = {"user"})
    Page<Announcement> findByContentContainingAndStatusNot(String content, BoardStatus status, Pageable pageable);
}
