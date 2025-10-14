package com.example.demo.domain.map.service;

import java.util.List;

import com.example.demo.domain.map.dto.MapMarkerAddResponseDto;
import com.example.demo.domain.map.dto.MapMarkerRequestDto;
import com.example.demo.domain.map.dto.MapMarkerSimpleDto;

public interface MapMarkerService {
	
	
	List<MapMarkerSimpleDto> getAllMarkersSimple();
    
	MapMarkerAddResponseDto addMarker(MapMarkerRequestDto requestDto);

}

