package com.englishapp.api_server.domain;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum LicensePeriod {

    ONEMONTH(1, "1개월"),
    THREEMONTH(3, "3개월"),
    SIXMONTH(6, "6개월"),
    ONEYEAR(12, "12개월");

    private final int months;
    private final String description;
}
