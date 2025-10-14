package com.example.demo.domain.map.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.domain.map.dto.MapMarkerAddResponseDto;
import com.example.demo.domain.map.dto.MapMarkerRequestDto;
import com.example.demo.domain.map.dto.MapMarkerSimpleDto;
import com.example.demo.domain.map.service.MapMarkerService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@Tag(name = "Map API", description = "지도 마커 관리 API")
@RestController
@RequestMapping("/api/map")
@RequiredArgsConstructor
public class MapController {

	private final MapMarkerService mapMarkerService;
	

	@GetMapping("/markers")
	@Operation(summary = "지도 마커 목록 조회", description = "마커 목록을 조회합니다")
	public ResponseEntity<List<MapMarkerSimpleDto>> getMarker() {
		List<MapMarkerSimpleDto> responseDto = mapMarkerService.getAllMarkersSimple();
		
		return ResponseEntity.ok(responseDto);
	}
	
	@PostMapping("/markers")
	@Operation(summary = "지도 마커 저장", description = "새로운 마커를 저장합니다")
	public ResponseEntity<MapMarkerAddResponseDto> addMarker(@RequestBody MapMarkerRequestDto requestDto) {
		MapMarkerAddResponseDto responseDto = mapMarkerService.addMarker(requestDto);
		
		return ResponseEntity.ok(responseDto);
	}
}

