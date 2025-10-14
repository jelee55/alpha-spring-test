import { useState, useEffect, useRef } from "react"
import { Map, MapMarker } from "react-kakao-maps-sdk"
import useKakaoLoader from "./useKakaoLoader"
import "./KakaoMap.css"

export default function KakaoMap() {
  const [loading, error] = useKakaoLoader()
  const [map, setMap] = useState(null)
  const [keyword, setKeyword] = useState("")
  const [places, setPlaces] = useState([])
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [pagination, setPagination] = useState(null)
  const [backendMarkers, setBackendMarkers] = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [markerTitle, setMarkerTitle] = useState("")
  const psRef = useRef(null)
  const geocoderRef = useRef(null)

  // 지도가 생성되면 Places 서비스 및 Geocoder 객체 생성
  useEffect(() => {
    if (map && window.kakao && window.kakao.maps && window.kakao.maps.services) {
      psRef.current = new window.kakao.maps.services.Places()
      geocoderRef.current = new window.kakao.maps.services.Geocoder()
    }
  }, [map])

  // 백엔드에서 마커 데이터 가져오기
  useEffect(() => {
    const fetchBackendMarkers = async () => {
      try {
        console.log('마커 데이터 요청 중: /api/map/markers')
        const response = await fetch('/api/map/markers')
        console.log('응답 상태:', response.status, response.statusText)
        
        if (response.ok) {
          const data = await response.json()
          console.log('마커 데이터 로드 성공:', data)
          setBackendMarkers(data)
        } else {
          console.error('API 응답 실패:', response.status, response.statusText)
          console.error('백엔드 서버가 실행 중인지 확인하세요 (localhost:8080)')
        }
      } catch (error) {
        console.error('마커 데이터 로딩 실패:', error)
        console.error('백엔드 서버가 실행되지 않았을 수 있습니다.')
      }
    }

    fetchBackendMarkers()
  }, [])

  // 백엔드 마커가 로드되면 지도 범위 자동 조정
  useEffect(() => {
    if (map && backendMarkers.length > 0 && window.kakao && window.kakao.maps) {
      const bounds = new window.kakao.maps.LatLngBounds()
      
      backendMarkers.forEach((marker) => {
        bounds.extend(new window.kakao.maps.LatLng(marker.latlng.lat, marker.latlng.lng))
      })
      
      // 모든 마커가 보이도록 지도 범위 설정
      map.setBounds(bounds)
      console.log('지도 범위 자동 조정 완료')
    }
  }, [map, backendMarkers])

  // 키워드 검색 함수
  const searchPlaces = () => {
    if (!keyword.trim()) {
      alert("키워드를 입력해주세요!")
      return
    }

    if (!psRef.current) {
      alert("검색 서비스를 초기화하는 중입니다. 잠시 후 다시 시도해주세요.")
      return
    }

    // 장소검색 객체를 통해 키워드로 장소검색을 요청합니다
    psRef.current.keywordSearch(keyword, placesSearchCB)
  }

  // 장소검색이 완료됐을 때 호출되는 콜백함수
  const placesSearchCB = (data, status, paginationObj) => {
    if (status === window.kakao.maps.services.Status.OK) {
      setPlaces(data)
      setPagination(paginationObj)
      setSelectedPlace(null)

      // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
      const bounds = new window.kakao.maps.LatLngBounds()
      data.forEach((place) => {
        bounds.extend(new window.kakao.maps.LatLng(place.y, place.x))
      })
      map.setBounds(bounds)
    } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
      alert("검색 결과가 존재하지 않습니다.")
      setPlaces([])
    } else if (status === window.kakao.maps.services.Status.ERROR) {
      alert("검색 중 오류가 발생했습니다.")
      setPlaces([])
    }
  }

  // Enter 키로 검색
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      searchPlaces()
    }
  }

  // 페이지 번호 클릭
  const handlePageClick = (page) => {
    pagination.gotoPage(page)
  }

  // 지도 클릭 시 주소 찾기
  const handleMapClick = (_target, mouseEvent) => {
    if (!geocoderRef.current) return

    // react-kakao-maps-sdk에서는 mouseEvent에서 직접 latLng 접근
    const lat = mouseEvent.latLng.getLat()
    const lng = mouseEvent.latLng.getLng()

    // 좌표로 주소 찾기
    geocoderRef.current.coord2Address(lng, lat, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const address = result[0].address.address_name
        const roadAddress = result[0].road_address 
          ? result[0].road_address.address_name 
          : address

        setSelectedAddress({
          lat: lat,
          lng: lng,
          address: address,
          roadAddress: roadAddress
        })
      }
    })
  }

  // 마커 저장 함수
  const saveMarker = async () => {
    if (!selectedAddress) {
      alert("지도를 클릭하여 위치를 선택해주세요!")
      return
    }

    if (!markerTitle.trim()) {
      alert("마커 제목을 입력해주세요!")
      return
    }

    try {
      const response = await fetch('/api/map/markers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: markerTitle,
          latlng: {
            lat: selectedAddress.lat,
            lng: selectedAddress.lng
          },
          address: selectedAddress.address,
          roadAddress: selectedAddress.roadAddress
        })
      })

      if (response.ok) {
        alert("마커가 저장되었습니다!")
        setMarkerTitle("")
        setSelectedAddress(null)
        // 마커 목록 새로고침
        const markersResponse = await fetch('/api/map/markers')
        if (markersResponse.ok) {
          const data = await markersResponse.json()
          setBackendMarkers(data)
        }
      } else {
        alert("마커 저장에 실패했습니다.")
      }
    } catch (error) {
      console.error('마커 저장 실패:', error)
      alert("마커 저장 중 오류가 발생했습니다.")
    }
  }

  if (loading) return <div>지도 로딩 중...</div>
  if (error) return <div>지도 로딩 에러: {error.message}</div>

  return (
    <div className="map-container">
      <div className="map-sidebar">
        <div className="search-box">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="장소를 검색하세요"
            id="keyword"
          />
          <button onClick={searchPlaces}>검색</button>
        </div>

        {/* 주소 찾기 및 저장 섹션 */}
        <div className="address-save-section">
          <h3>마커 추가</h3>
          <p className="info-text">지도를 클릭하여 위치를 선택하세요</p>
          
          {selectedAddress && (
            <div className="selected-address">
              <p><strong>도로명:</strong> {selectedAddress.roadAddress}</p>
              <p><strong>지번:</strong> {selectedAddress.address}</p>
              <p><strong>좌표:</strong> {selectedAddress.lat.toFixed(6)}, {selectedAddress.lng.toFixed(6)}</p>
            </div>
          )}

          <input
            type="text"
            value={markerTitle}
            onChange={(e) => setMarkerTitle(e.target.value)}
            placeholder="마커 제목을 입력하세요"
            className="marker-title-input"
          />
          
          <button 
            onClick={saveMarker}
            className="save-button"
            disabled={!selectedAddress || !markerTitle.trim()}
          >
            마커 저장
          </button>
        </div>

        <ul id="placesList" className="places-list">
          {places.map((place, index) => (
            <li
              key={place.id}
              className="item"
              onMouseEnter={() => setSelectedPlace(place)}
              onMouseLeave={() => setSelectedPlace(null)}
            >
              <span className={`markerbg marker_${index + 1}`}></span>
              <div className="info">
                <h5>{place.place_name}</h5>
                {place.road_address_name ? (
                  <>
                    <span>{place.road_address_name}</span>
                    <span className="jibun gray">{place.address_name}</span>
                  </>
                ) : (
                  <span>{place.address_name}</span>
                )}
                <span className="tel">{place.phone}</span>
              </div>
            </li>
          ))}
        </ul>

        {pagination && (
          <div id="pagination" className="pagination">
            {Array.from({ length: pagination.last }, (_, i) => i + 1).map(
              (page) => (
                <a
                  key={page}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    handlePageClick(page)
                  }}
                  className={page === pagination.current ? "on" : ""}
                >
                  {page}
                </a>
              )
            )}
          </div>
        )}
      </div>

      <Map
        id="map"
        center={{
          // 초기 중심 (제주도) - 마커 로드 후 자동 조정됨
          lat: 33.450701,
          lng: 126.570667,
        }}
        style={{
          width: "100%",
          height: "600px",
        }}
        level={6}
        onCreate={setMap}
        onClick={handleMapClick}
      >
        {/* 선택된 위치 임시 마커 */}
        {selectedAddress && (
          <MapMarker
            position={{
              lat: selectedAddress.lat,
              lng: selectedAddress.lng
            }}
            image={{
              src: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png",
              size: {
                width: 64,
                height: 69,
              },
              options: {
                offset: {
                  x: 27,
                  y: 69,
                },
              },
            }}
          />
        )}

        {/* 백엔드에서 가져온 마커들 */}
        {backendMarkers.map((marker, index) => (
          <MapMarker
            key={`backend-${index}`}
            position={marker.latlng}
            image={{
              src: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
              size: {
                width: 24,
                height: 35,
              },
            }}
            title={marker.title}
          />
        ))}

        {/* 검색 결과 마커들 */}
        {places.map((place, index) => (
          <MapMarker
            key={place.id}
            position={{
              lat: place.y,
              lng: place.x,
            }}
            image={{
              src: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png",
              size: {
                width: 36,
                height: 37,
              },
              options: {
                spriteSize: {
                  width: 36,
                  height: 691,
                },
                spriteOrigin: {
                  x: 0,
                  y: index * 46 + 10,
                },
                offset: {
                  x: 13,
                  y: 37,
                },
              },
            }}
            onMouseOver={() => setSelectedPlace(place)}
            onMouseOut={() => setSelectedPlace(null)}
          >
            {selectedPlace && selectedPlace.id === place.id && (
              <div style={{ padding: "5px", color: "#000" }}>
                {place.place_name}
              </div>
            )}
          </MapMarker>
        ))}
      </Map>
    </div>
  )
}

