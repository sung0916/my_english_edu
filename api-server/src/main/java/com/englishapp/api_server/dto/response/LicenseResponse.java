package com.englishapp.api_server.dto.response;

import com.englishapp.api_server.domain.LicenseStatus;
import com.englishapp.api_server.entity.StudentLicense;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class LicenseResponse {

    private Long licenseId;
    private Long productId;
    private String productName;
    private LicenseStatus status;
    private String startAt;
    private String endAt;
    private boolean isPaused;

    public static LicenseResponse from(StudentLicense license) {

        String productName = license.getSubscription().getProduct().getProductName();
        Long productId = license.getSubscription().getProduct().getId();

        return LicenseResponse.builder()
                .licenseId(license.getId())
                .productId(productId)
                .productName(productName)
                .status(license.getStatus())
                .startAt(license.getStartAt() != null
                        ? license.getStartAt().toLocalDate().toString()
                        : "-")
                .endAt(license.getEndAt() != null
                        ? license.getEndAt().toLocalDate().toString()
                        : "-")
                .isPaused(license.getStatus() == LicenseStatus.PAUSED)
                .build();
    }

    // 상품명까지 포함하는 Setter (Service에서 주입
    public void setProductName(String productName) {
        this.productName = productName;
    }
}
