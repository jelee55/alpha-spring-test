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
  const [postcode, setPostcode] = useState("")
  const [roadAddress, setRoadAddress] = useState("")
  const [detailAddress, setDetailAddress] = useState("")
  const psRef = useRef(null)
  const geocoderRef = useRef(null)
  const postcodeLayerRef = useRef(null)

  // 지도가 생성되면 Places 서비스 및 Geocoder 객체 생성
  useEffect(() => {
    if (map && window.kakao && window.kakao.maps && window.kakao.maps.services) {
      psRef.current = new window.kakao.maps.services.Places()
      geocoderRef.current = new window.kakao.maps.services.Geocoder()
    }
  }, [map])

  // Kakao SDK 초기화 (네비게이션용) - 주석처리
  // useEffect(() => {
  //   if (window.Kakao && !window.Kakao.isInitialized()) {
  //     const kakaoKey = process.env.REACT_APP_KAKAOMAP_KEY
  //     if (kakaoKey) {
  //       window.Kakao.init(kakaoKey)
  //       console.log('카카오 SDK 초기화 완료')
  //     }
  //   }
  // }, [])

  // 백엔드에서 마커 데이터 가져오기
  useEffect(() => {
    const fetchBackendMarkers = async () => {
      try {
        console.log('마커 데이터 요청 중: http://localhost:8080/api/map/markers')
        const response = await fetch('http://localhost:8080/api/map/markers')
        console.log('응답 상태:', response.status, response.statusText)
        
        if (response.ok) {
          const data = await response.json()
          console.log('마커 데이터 로드 성공:', data)
          console.log('마커 개수:', data.length)
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
        // 다양한 API 응답 형식 지원
        const lat = marker.latlng?.lat || marker.latitude || marker.lat
        const lng = marker.latlng?.lng || marker.longitude || marker.lng
        
        if (lat && lng) {
          bounds.extend(new window.kakao.maps.LatLng(lat, lng))
        }
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
      const markerData = {
        title: markerTitle,
        latlng: {
          lat: selectedAddress.lat,
          lng: selectedAddress.lng
        },
        address: selectedAddress.address,
        roadAddress: selectedAddress.roadAddress
      }
      
      console.log('=== 마커 저장 데이터 ===')
      console.log('제목:', markerData.title)
      console.log('위도:', markerData.latlng.lat)
      console.log('경도:', markerData.latlng.lng)
      console.log('지번 주소:', markerData.address)
      console.log('도로명 주소:', markerData.roadAddress)
      console.log('전체 데이터:', markerData)
      console.log('===================')
      
      const response = await fetch('http://localhost:8080/api/map/markers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(markerData)
      })

      if (response.ok) {
        alert("마커가 저장되었습니다!")
        setMarkerTitle("")
        setSelectedAddress(null)
        // 마커 목록 새로고침
        const markersResponse = await fetch('http://localhost:8080/api/map/markers')
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

  // Daum 우편번호 검색 팝업 열기
  const execDaumPostcode = () => {
    if (!window.daum || !window.daum.Postcode) {
      alert("우편번호 API가 로드되지 않았습니다.")
      return
    }

    new window.daum.Postcode({
      oncomplete: function (data) {
        let addr = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress

        setPostcode(data.zonecode)
        setRoadAddress(addr)
        
        // 주소로 좌표 검색
        if (geocoderRef.current) {
          geocoderRef.current.addressSearch(addr, (result, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
              const lat = parseFloat(result[0].y)
              const lng = parseFloat(result[0].x)
              
              setSelectedAddress({
                lat: lat,
                lng: lng,
                address: data.jibunAddress || addr,
                roadAddress: addr
              })

              // 지도 중심을 해당 위치로 이동
              if (map) {
                map.setCenter(new window.kakao.maps.LatLng(lat, lng))
                map.setLevel(3)
              }
            }
          })
        }

        closeDaumPostcode()
      },
      width: '100%',
      height: '100%',
      maxSuggestItems: 5,
      shorthand: false
    }).embed(postcodeLayerRef.current)

    postcodeLayerRef.current.style.display = 'block'
    initLayerPosition()
  }

  // 우편번호 검색 팝업 닫기
  const closeDaumPostcode = () => {
    if (postcodeLayerRef.current) {
      postcodeLayerRef.current.style.display = 'none'
    }
  }

  // 레이어 팝업 위치 초기화
  const initLayerPosition = () => {
    const width = 400
    const height = 500
    const borderWidth = 5

    const layer = postcodeLayerRef.current
    layer.style.width = `${width}px`
    layer.style.height = `${height}px`
    layer.style.border = `${borderWidth}px solid #ccc`
    layer.style.left = `${((window.innerWidth || document.documentElement.clientWidth) - width) / 2 - borderWidth}px`
    layer.style.top = `${((window.innerHeight || document.documentElement.clientHeight) - height) / 2 - borderWidth}px`
  }

  // 카카오내비 길 안내 시작 - 주석처리
  // const startNavigation = (marker) => {
  //   if (!window.Kakao || !window.Kakao.isInitialized()) {
  //     alert('카카오 SDK가 초기화되지 않았습니다.')
  //     return
  //   }

  //   if (!window.Kakao.Navi) {
  //     alert('카카오내비를 사용할 수 없습니다. 모바일에서 시도해주세요.')
  //     return
  //   }

  //   console.log('네비게이션 시작:', marker.title, marker.latlng)

  //   try {
  //     window.Kakao.Navi.start({
  //       name: marker.title,
  //       x: marker.latlng.lng,
  //       y: marker.latlng.lat,
  //       coordType: 'wgs84',
  //     })
  //   } catch (error) {
  //     console.error('네비게이션 시작 실패:', error)
  //     alert('카카오내비 실행에 실패했습니다. 모바일 환경에서만 사용 가능합니다.')
  //   }
  // }

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
          
          {/* 우편번호 검색 */}
          <div className="postcode-search">
            <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
              <input
                type="text"
                value={postcode}
                readOnly
                placeholder="우편번호"
                style={{ width: '100px' }}
              />
              <button onClick={execDaumPostcode} className="postcode-button">
                우편번호 찾기
              </button>
            </div>
            <input
              type="text"
              value={roadAddress}
              readOnly
              placeholder="주소"
              style={{ width: '100%', marginBottom: '10px' }}
            />
            <input
              type="text"
              value={detailAddress}
              onChange={(e) => setDetailAddress(e.target.value)}
              placeholder="상세주소"
              style={{ width: '100%', marginBottom: '10px' }}
            />
          </div>

          <p className="info-text" style={{ marginTop: '10px' }}>
            또는 지도를 클릭하여 위치를 선택하세요
          </p>
          
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
        {backendMarkers.map((marker, index) => {
          // 다양한 API 응답 형식 지원
          const position = marker.latlng 
            ? marker.latlng 
            : { 
                lat: marker.latitude || marker.lat, 
                lng: marker.longitude || marker.lng 
              }
          
          return (
            <MapMarker
              key={`backend-${index}`}
              position={position}
              image={{
                src: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
                size: {
                  width: 24,
                  height: 35,
                },
              }}
              title={marker.title}
              // 네비게이션 기능 주석처리
              // onClick={() => startNavigation(marker)}
              // clickable={true}
            >
              {/* 네비게이션 인포윈도우 주석처리 */}
              {/* <div style={{ 
                padding: "5px 10px", 
                color: "#000", 
                backgroundColor: "white",
                border: "1px solid #ccc",
                borderRadius: "5px",
                fontSize: "12px",
                whiteSpace: "nowrap",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
              }}>
                <strong>{marker.title}</strong>
                <div style={{ fontSize: "10px", color: "#666", marginTop: "3px" }}>
                  클릭하여 길 안내
                </div>
              </div> */}
            </MapMarker>
          )
        })}

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

      {/* 우편번호 검색 레이어 */}
      <div
        ref={postcodeLayerRef}
        id="postcodeLayer"
        style={{
          display: 'none',
          position: 'fixed',
          overflow: 'hidden',
          zIndex: 999,
          backgroundColor: 'white',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <img
          src="//t1.daumcdn.net/postcode/resource/images/close.png"
          onClick={closeDaumPostcode}
          style={{
            cursor: 'pointer',
            position: 'absolute',
            right: '-3px',
            top: '-3px',
            zIndex: 1
          }}
          alt="닫기"
        />
      </div>
    </div>
  )
}

