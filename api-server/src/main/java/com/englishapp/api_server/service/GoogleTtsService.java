package com.englishapp.api_server.service;

public interface GoogleTtsService {

    /**
     * 주어진 텍스트를 음성 테이터(byte 배열)로 변환
     *
     * @param text 음성으로 변환할 텍스트
     * @return MP3 형식의 음성 데이터
     **/
    byte[] synthesizeText(String text);
}
