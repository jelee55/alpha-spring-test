package com.example.demo.domain.map.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.domain.map.dto.MapMarker;
import com.example.demo.domain.map.dto.MapMarkerAddResponseDto;
import com.example.demo.domain.map.dto.MapMarkerRequestDto;
import com.example.demo.domain.map.dto.MapMarkerSimpleDto;
import com.example.demo.domain.map.mapper.MapMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MapMarkerServiceImpl implements MapMarkerService {
    
	private final MapMapper mapMapper;
	
	@Override
	public List<MapMarkerSimpleDto> getAllMarkersSimple() {
		return mapMapper.selectAll();
	}
	
	@Override
	public MapMarkerAddResponseDto addMarker(MapMarkerRequestDto requestDto) {
		try {
			MapMarker mapMarker = MapMarker.builder()
					.title(requestDto.getTitle())
					.latitude(requestDto.getLatlng().getLat())
					.longitude(requestDto.getLatlng().getLng())
					.address(requestDto.getAddress())
					.roadAddress(requestDto.getRoadAddress())
					.build();
			
			int result = mapMapper.insertMarker(mapMarker);
			
			if (result > 0) {
				return MapMarkerAddResponseDto.builder()
						.success(true)
						.message("마커가 성공적으로 저장되었습니다.")
						.id(mapMarker.getId())
						.build();
			} else {
				return MapMarkerAddResponseDto.builder()
						.success(false)
						.message("마커 저장에 실패했습니다.")
						.build();
			}
		} catch (Exception e) {
			return MapMarkerAddResponseDto.builder()
					.success(false)
					.message("마커 저장 중 오류가 발생했습니다: " + e.getMessage())
					.build();
		}
	}
    
    
   
}

