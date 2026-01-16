package com.englishapp.api_server.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
public class LicenseRequest {

    private LocalDate startDate;
    private Long orderItemId;

    public LicenseRequest(LocalDate startDate, Long orderItemId) {
        this.startDate = startDate;
        this.orderItemId = orderItemId;
    }
}
