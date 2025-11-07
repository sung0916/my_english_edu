package com.englishapp.api_server.service.impl;

import com.englishapp.api_server.service.GoogleTtsService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Service
@Profile("local")
@Slf4j
public class DummyGoogleTtsServiceImpl implements GoogleTtsService {

    @Override
    public byte[] synthesizeText(String text) {

        // 실제 API를 호출하지 않고, 더미 데이터를 반환합니다.
        log.warn("DUMMY TTS SERVICE: '{}'에 대한 음성을 생성하는 척합니다.", text);
        // 비어있는 byte 배열을 반환하여 NullPointerException을 방지합니다.
        return new byte[0];
    }
}
