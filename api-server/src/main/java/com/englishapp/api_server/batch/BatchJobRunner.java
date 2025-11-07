package com.englishapp.api_server.batch;

import com.englishapp.api_server.service.AudioGenerationBatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class BatchJobRunner implements CommandLineRunner {

    private final AudioGenerationBatchService batchService;

    @Override
    public void run(String... args) throws Exception {

        for (String arg : args) {
            if (arg.equals("--job=generateAudio")) {
                batchService.generateMissingAudios();
            }
        }
    }
}
