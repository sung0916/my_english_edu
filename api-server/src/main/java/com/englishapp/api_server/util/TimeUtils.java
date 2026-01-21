package com.englishapp.api_server.util;

import com.englishapp.api_server.entity.User;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

public class TimeUtils {

    public static final ZoneId KST = ZoneId.of("Asia/Seoul");
    public static final ZoneId UTC = ZoneId.of("UTC");
    private static final String DEFAULT_TIMEZONE = "Asia/Seoul";

    // 유저의 현지 날짜 (LocalDate) -> UTC 시작 시간(OffsetDateTime) 변환
    public static OffsetDateTime toUtcStartOfDay(LocalDate date, String userTimezone) {

        ZoneId zone = (userTimezone != null)
                ? ZoneId.of(userTimezone)
                : KST;

        return date.atStartOfDay(zone).toOffsetDateTime();
    }

    // UTC(OffsetDateTime) -> 유저에게 보여줄 문자열 변환
    public static String toUserLocalString(OffsetDateTime utcTime, String userTimezone) {

        if (utcTime == null) return "";
        ZoneId zone = (userTimezone != null)
                ? ZoneId.of(userTimezone)
                : KST;

        return utcTime.atZoneSameInstant(zone).format(DateTimeFormatter.ofPattern("yy-MM-dd HH:mm:ss"));
    }

    // 해당 지역 기준으로 날짜의 끝 시간 -> UTC OffsetDateTime으로 변환
    public static OffsetDateTime toUtcEndOfDay(LocalDate date, String userTimezone) {

        ZoneId zone = (userTimezone != null)
                ? ZoneId.of(userTimezone)
                : ZoneId.of("Asia/Seoul");

        return date.atTime(LocalTime.MAX)
                .atZone(zone)
                .toOffsetDateTime();
    }

    // 유저별 Timezone 반환 (default는 Asia/Seoul)
    public static String resolvedTimezone(User user) {

        if (user == null || user.getTimezone() == null || user.getTimezone().trim().isEmpty()) {
            return DEFAULT_TIMEZONE;
        }

        return user.getTimezone();
    }
}
