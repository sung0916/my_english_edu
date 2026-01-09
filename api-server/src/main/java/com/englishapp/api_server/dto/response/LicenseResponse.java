package com.englishapp.api_server.dto.response;

import com.englishapp.api_server.domain.LicensePeriod;
import com.englishapp.api_server.domain.LicenseStatus;
import com.englishapp.api_server.entity.StudentLicense;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class LicenseResponse {

    private Long licenseId;
    private String productName;
    private LicensePeriod period;
    private LicenseStatus status;
    private LocalDateTime startAt;
    private LocalDateTime endAt;

    public static LicenseResponse from(StudentLicense license) {

        // Subscription과 Product가 Lazy Loading으로 연결되어 있다고 가정
        // TODO: 실제로는 Fetch Join을 쓴 쿼리가 필요할 수 있음 - 여기서는 구조만 잡음
        return LicenseResponse.builder()
                .licenseId(license.getId())
                .period(license.getLicensePeriod())
                .status(license.getStatus())
                .startAt(license.getStartAt())
                .endAt(license.getEndAt())
                .build();
    }

    // 상품명까지 포함하는 Setter (Service에서 주입
    public void setProductName(String productName) {
        this.productName = productName;
    }
}
