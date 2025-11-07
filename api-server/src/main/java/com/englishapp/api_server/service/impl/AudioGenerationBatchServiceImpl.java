package com.englishapp.api_server.service.impl;

import com.englishapp.api_server.domain.AudibleContent;
import com.englishapp.api_server.domain.EnglishType;
import com.englishapp.api_server.entity.Sentence;
import com.englishapp.api_server.entity.Word;
import com.englishapp.api_server.repository.SentenceRepository;
import com.englishapp.api_server.repository.WordRepository;
import com.englishapp.api_server.service.AudioGenerationBatchService;
import com.englishapp.api_server.service.FileStorageService;
import com.englishapp.api_server.service.GoogleTtsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AudioGenerationBatchServiceImpl implements AudioGenerationBatchService {

    private final WordRepository wordRepository;
    private final SentenceRepository sentenceRepository;
    private final GoogleTtsService googleTtsService;
    private final FileStorageService fileStorageService;

    @Override
    @Transactional
    public void generateMissingAudios() {

        log.info("===오디오 파일 생성 배치 작업 시작===");

        List<Word> targetWords = wordRepository.findByAudioUrlIsNull();
        generateAudiosForContentList(targetWords, EnglishType.WORD);

        List<Sentence> targetSentences = sentenceRepository.findByAudioUrlIsNull();
        generateAudiosForContentList(targetSentences, EnglishType.SENTENCE);

        log.info("===전체 오디오 파일 생성 작업 완료===");
    }

    /**
     * AudibleContent 리스트를 받아 오디오 URL을 생성하고 업데이트하는 제네릭 메서드
     *
     * @param contentList Word 또는 Sentence 리스트
     * @param type        WORD 또는 SENTENCE enum
     **/
    private <T extends AudibleContent> void generateAudiosForContentList(
            List<T> contentList, EnglishType type) {

        log.info("[{}] 타입 오디오 생성 대상: {}건", type, contentList.size());

        for (T content : contentList) {

            try {
                // 1. TTS API 호출 및 파일 스토리지 업로드
                byte[] audioData = googleTtsService.synthesizeText(content.getContent());

                // 2. 파일 저장 경로와 이름 설정
                String directory = type == EnglishType.WORD ? "words" : "sentences";
                String subPath = "audio/" + directory; // 저장할 하위 폴더 (예: "audio/words")
                String fileName = content.getId() + ".mp3"; // 저장할 파일 이름 (예: "123.mp3")

                // 3. FileStorageService의 올바른 메서드 호출
                String audioUrl = fileStorageService.storeFile(audioData, fileName, subPath);

                // 4. 받아온 URL을 엔티티에 업데이트
                content.updateAudioUrl(audioUrl);
                // log.info("[{} ID: {}] 오디오 파일 생성 및 URL 저장 완료", type, content.getId());

            } catch (Exception e) {
                log.error("[{} ID: {} 오디오 파일 생성 중 에러 발생: {}", type, content.getId(), e.getMessage());
            }
        }
    }
}
