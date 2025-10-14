-- test 데이터베이스 사용
USE test;

-- 기존 테이블이 있다면 삭제 (선택사항)
-- DROP TABLE IF EXISTS map_markers;

-- 지도 마커 테이블 생성
CREATE TABLE IF NOT EXISTS map_markers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL COMMENT '마커 제목',
    latitude DOUBLE NOT NULL COMMENT '위도',
    longitude DOUBLE NOT NULL COMMENT '경도',
    address VARCHAR(255) COMMENT '지번 주소',
    road_address VARCHAR(255) COMMENT '도로명 주소',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='지도 마커 정보';

-- 인덱스 생성
CREATE INDEX idx_map_markers_title ON map_markers(title);
CREATE INDEX idx_map_markers_location ON map_markers(latitude, longitude);

-- 더미 데이터 추가
INSERT INTO map_markers (title, latitude, longitude, address, road_address) VALUES
('카카오', 33.450705, 126.570677, '제주특별자치도 제주시 첨단동', '제주특별자치도 제주시 첨단로 242'),
('생태연못', 33.450936, 126.569477, '제주특별자치도 제주시 첨단동', '제주특별자치도 제주시 첨단로 235'),
('텃밭', 33.450879, 126.56994, '제주특별자치도 제주시 첨단동', '제주특별자치도 제주시 첨단로 238'),
('근린공원', 33.451393, 126.570738, '제주특별자치도 제주시 첨단동', '제주특별자치도 제주시 첨단로 245'),
('제주시청', 33.499621, 126.531188, '제주특별자치도 제주시 이도1동', '제주특별자치도 제주시 동광로 51'),
('제주공항', 33.506502, 126.493129, '제주특별자치도 제주시 용담2동', '제주특별자치도 제주시 공항로 2');

-- 데이터 확인
SELECT * FROM map_markers;

