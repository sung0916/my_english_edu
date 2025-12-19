package com.englishapp.api_server.controller;

import com.englishapp.api_server.dto.response.PlaceDto;
import com.englishapp.api_server.entity.Place;
import com.englishapp.api_server.repository.PlaceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/places")
@RequiredArgsConstructor
@Slf4j
public class PlaceController {

    private final PlaceRepository placeRepository;

    @PostMapping
    public ResponseEntity<Place> createPlace(@RequestBody Place place) {
        Place savedPlace = placeRepository.save(place);

        try {
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(savedPlace);
        } catch (Exception e) {
            log.error("Error 발생 => ", e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .build();
        }
    }

    @GetMapping("/getPlaces")
    public List<PlaceDto> getAllPlaces() {

        return placeRepository.findAll().stream()
                .map(place -> {
                    PlaceDto dto = new PlaceDto();

                    // 👇 이 부분(데이터 주입)이 빠져있거나 틀렸는지 확인하세요!
                    dto.setId(place.getId());
                    dto.setPlaceName(place.getPlaceName()); // Entity의 getter 사용

                    return dto;
                })
                .collect(Collectors.toList());
    }
}