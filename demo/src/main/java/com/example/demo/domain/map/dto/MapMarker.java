package com.example.demo.domain.map.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MapMarker {
    private Long id;
    private String title;
    private Double latitude;
    private Double longitude;
    private String address;
    private String roadAddress;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

