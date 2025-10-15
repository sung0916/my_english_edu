package com.englishapp.api_server.controller;

import com.englishapp.api_server.entity.Place;
import com.englishapp.api_server.repository.PlaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/places")
@RequiredArgsConstructor
public class PlaceController {

    private final PlaceRepository placeRepository;

    @PostMapping
    public ResponseEntity<Place> createPlace(@RequestBody Place place) {
        Place savedPlace = placeRepository.save(place);
        return ResponseEntity.ok(savedPlace);
    }

    @GetMapping
    public ResponseEntity<List<Place>> getAllPlaces() {
        List<Place> places = placeRepository.findAll();
        return ResponseEntity.ok(places);
    }
}