package com.example.demo.domain.map.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MapMarkerAddResponseDto {
    private Boolean success;
    private String message;
    private Long id;
}

