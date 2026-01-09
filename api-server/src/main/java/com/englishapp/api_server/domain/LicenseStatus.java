package com.englishapp.api_server.domain;

public enum LicenseStatus {

    PENDING,   // 결제 완료, 시작 전 (날짜 미지정)
    ACTIVE,    // 사용 중
    PAUSED,    // 일시 정지 (관리자 처리)
    EXPIRED    // 기간 만료
}
