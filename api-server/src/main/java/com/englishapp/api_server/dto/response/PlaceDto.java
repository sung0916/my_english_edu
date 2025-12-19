package com.englishapp.api_server.dto.response;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class PlaceDto {

    private Long id;
    private String placeName;
}
