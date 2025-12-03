package com.englishapp.api_server.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "word_details")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Getter
@Builder
public class WordDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "detail_id")
    private Long detailId;

    /** Word 테이블과 1:1 매핑
     *  FetchType.LAZY: 불필요한 조인 방지 (성능 최적화)
     *  unique = true: 한 단어 당 하나의 설명 / 이미지만 존재하도록 제약 */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "word_id", nullable = false, unique = true)
    private Word word;

    /** 게임 내 문제로 출제될 영어 설명 문장 */
    @Column(name = "description_en", nullable = false, length = 500)
    private String description;

    /** 카드 뒤집을 때 나올 이미지 URL
     *  개발 단계에서는 placehold.co 같은 더미 URL 사용 */
    @Column(name = "image_url", length = 500)
    private String imageUrl;

    /** 편의 메서드(추후 필요 시 적용) */
    /*public void updateImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }*/
}
