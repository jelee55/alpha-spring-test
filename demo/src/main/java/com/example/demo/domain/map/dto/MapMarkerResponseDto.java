package com.example.demo.domain.map.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MapMarkerResponseDto {
    private Long id;
    private String title;
    private LatLng latlng;
    private String address;
    private String roadAddress;
}

