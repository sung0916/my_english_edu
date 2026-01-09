package com.englishapp.api_server.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
public class LicenseRequest {

    private LocalDate startDate;
}
