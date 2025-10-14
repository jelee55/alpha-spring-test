import React from 'react';
import './App.css';
import KakaoMap from './KakaoMap';

function App() {
  return (
    <div className="App">
      {/* 여기기 */}
      <header className="App-header">
        <h1>카카오맵 장소 검색</h1>
        
        <div className="map-section" style={{ marginTop: '20px' }}>
          <KakaoMap />
        </div>
      </header>
    </div>
  );
}

export default App;
