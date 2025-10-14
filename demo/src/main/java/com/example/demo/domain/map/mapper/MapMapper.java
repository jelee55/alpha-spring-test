package com.example.demo.domain.map.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.example.demo.domain.map.dto.MapMarkerSimpleDto;

@Mapper
public interface MapMapper {
    

    List<MapMarkerSimpleDto> selectAll();
}
