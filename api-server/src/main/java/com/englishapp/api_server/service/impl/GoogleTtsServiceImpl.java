package com.englishapp.api_server.service.impl;

import com.englishapp.api_server.service.GoogleTtsService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Service
@Profile("prod") // ❗️❗️ "prod" 프로필(개발용)
@Slf4j
public class GoogleTtsServiceImpl implements GoogleTtsService {

    @Override
    public byte[] synthesizeText(String text) {

        log.info("Google TTS API 호출: {}", text);

        // TODO: 실제 Google Cloud TTS API 연동 코드 구현
        // 1. TextToSpeechClient 초기화
        // 2. SynthesisInput 설정 (text)
        // 3. VoiceSelectionParams 설정 (언어, 음성 등)
        // 4. AudioConfig 설정 (MP3)
        // 5. API 호출 (client.synthesizeSpeech(...))
        // 6. 응답에서 오디오 콘텐츠(ByteString)를 byte[]로 변환하여 반환

        // 아래는 임시 placeholder 코드입니다. 실제 구현으로 대체해야 합니다.
        if (text == null || text.isEmpty()) {
            return new byte[0];
        }
        // 실제로는 API 응답 바이트 배열을 반환해야 함
        return text.getBytes();
    }
}
