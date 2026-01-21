package com.englishapp.api_server.entity;

import com.englishapp.api_server.domain.BoardStatus;
import com.englishapp.api_server.util.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "announcements")
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Announcement extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "announcement_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(length = 50, nullable = false)
    private String title;

    @Lob
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Builder.Default  // 초기값 0 보장
    @Column(name = "view_count", nullable = false)
    private int viewCount = 0;

    @Setter  //게시글 상태 변경을 위해 설정
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private BoardStatus status = BoardStatus.ACTIVE;

    // 게시글 내용 수정을 위한 메서드 (Dirty Checking)
    public void update(String title, String content) {
        if (title != null && !title.isEmpty()) {
            this.title = title;
        }
        if (content != null && !content.isEmpty()) {
            this.content = content;
        }
    }

    // 조회수 증가
    public void increaseViewCount() {
        this.viewCount++;
    }
}
