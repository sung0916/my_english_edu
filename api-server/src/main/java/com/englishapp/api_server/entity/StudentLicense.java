package com.englishapp.api_server.entity;

import com.englishapp.api_server.domain.LicenseLevel;
import com.englishapp.api_server.domain.LicensePeriod;
import com.englishapp.api_server.domain.LicenseStatus;
import com.englishapp.api_server.util.BaseTimeEntity;
import com.englishapp.api_server.util.TimeUtils;
import jakarta.persistence.*;
import lombok.*;

import java.time.*;
import java.time.temporal.ChronoUnit;

@Entity
@Table(name = "student_licenses")
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class StudentLicense extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "license_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_user_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subscription_id")
    private Subscription subscription;

    @Enumerated(EnumType.STRING)
    @Column(name = "license_period")
    private LicensePeriod licensePeriod;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private LicenseStatus status;

    @Column(name = "start_at")
    private OffsetDateTime startAt;

    @Column(name = "end_at")
    private OffsetDateTime endAt;

    @Column(name = "remaining_seconds")  // 일시정지 (초 단위로 정밀도 보장)
    private Long remainingSeconds;

    // TODO: 혹시 몰라서 만든 학생 별 레벨에 따른 진행 가능한 프로그램 지정용
    @Enumerated(EnumType.STRING)
    @Column(name = "license_level")
    private LicenseLevel level;

    // 동시성 제어를 위한 버전 필드 (일시정지, 재개 버튼 연타 시 데이터 꼬임 방지)
    @Version
    private Long version;

    // 결제 직후, 라이선스 생성 메서드
    public static StudentLicense createLicense(User student, Subscription subscription, LicensePeriod period) {

        return StudentLicense.builder()
                .student(student)
                .subscription(subscription)
                .licensePeriod(period)
                .status(LicenseStatus.PENDING)
                // TODO: .level(라이센스레벨)
                .build();
    }

    // 사용 시작 (학생이 날짜 지정) - 유저의 Local 시간대로 지정
    public void activate(LocalDate startDate, String userTimezone) {
        if (this.status != LicenseStatus.PENDING) {
            throw new IllegalStateException("시작할 수 없는 상태입니다.");
        }

        // TimeUtils 활용 (시작일, 종료일 UTC로 변환)
        LocalDate endDate = startDate.plusMonths(this.licensePeriod.getMonths());

        // DB 저장은 UTC로 변환
        this.startAt = TimeUtils.toUtcStartOfDay(startDate, userTimezone);  // 00:00:00
        this.endAt = TimeUtils.toUtcEndOfDay(endDate, userTimezone);
        this.status = LicenseStatus.ACTIVE;
    }

    // 일시 정지 (관리자 기능) - 현재부터 종료까지 남은 시간 저장 후 멈춤 (글로벌)
    public void pause() {
        if (this.status != LicenseStatus.ACTIVE) {
            throw new IllegalStateException("활성 상태인 라이선스만 일시정지할 수 있습니다.");
        }
        OffsetDateTime now = OffsetDateTime.now();
        long secondsLeft = ChronoUnit.SECONDS.between(now, this.endAt);  // 남은 시간 계산 (초 단위)
        if (secondsLeft <= 0) {
            this.status = LicenseStatus.EXPIRED;
        } else {
            this.remainingSeconds = secondsLeft;
            this.endAt = null;  // 종료일 정보 삭제 (멈췄으므로)
            this.status = LicenseStatus.PAUSED;
        }
    }

    // 재시작 (관리자 기능, 글로벌)
    public void resume() {
        if (this.status != LicenseStatus.PAUSED) {
            throw new IllegalStateException("일시정지된 라이선스만 재시작할 수 있습니다.");
        }
        if (this.remainingSeconds == null || this.remainingSeconds <= 0) {
            this.status = LicenseStatus.EXPIRED;
            return;
        }

        this.endAt = OffsetDateTime.now().plusSeconds(this.remainingSeconds);
        this.remainingSeconds = null;  // 사용했으니 초기화
        this.status = LicenseStatus.ACTIVE;
    }

    // 환불 처리
    public void expire() {
        this.status = LicenseStatus.EXPIRED;
        this.endAt = OffsetDateTime.now(); // 즉시 종료
        this.remainingSeconds = null;     // 재시작 방지
    }
}
