package com.example.demo.domain.map.service;

import java.util.List;

import org.springframework.stereotype.Service;

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
    
    
   
}

