package com.englishapp.api_server.entity;

import com.englishapp.api_server.domain.ImageStatus;
import com.englishapp.api_server.domain.ImageType;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class Image {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "image_id")
    private Long id;

    @Column(name = "image_url", nullable = false, length = 2048)
    private String imageUrl;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "file_size", nullable = false)
    private int fileSize;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "image_status", nullable = false)
    private ImageStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "related_type", nullable = false, length = 20)
    private ImageType type;

    // 어느 Entity와 관계인지 명확하지 않아 id만 저장
    @Column(name = "related_id", nullable = false)
    private Long relatedId;
    
    // 스케줄러에 사용할 컬럼
    @Column(name = "created_at")
    @CreatedDate
    private LocalDateTime createdAt;

    /**
     * PENDING 상태의 이미지를 특정 엔티티와 연결하며 ACTIVE 상태로 변경합니다.
     *
     * @param relatedType 연결할 엔티티 타입 (e.g., ANNOUNCEMENT)
     * @param relatedId   연결할 엔티티의 PK ID
     */
    public void activate(ImageType relatedType, Long relatedId) {
        this.relatedId = relatedId;
        this.type = relatedType;
        this.status = ImageStatus.ACTIVE;
    }

    // 연결을 끊고 다시 PENDING 상태로 돌리는 메서드
    public void deactivate() {
        this.type = null;
        this.relatedId = null;
        this.status = ImageStatus.PENDING;
    }
}
