# Demo 프로젝트

Spring Boot 3.3.4 기반의 지도 마커 관리 REST API 프로젝트입니다.

## 🚀 빠른 시작

### 1. 프로젝트 클론

```bash
git clone <repository-url>
cd demo
```

### 2. 설정 파일 생성

이 프로젝트는 보안상의 이유로 설정 파일들이 `.gitignore`에 포함되어 있습니다.
클론 후 템플릿 파일에서 설정 파일을 생성해야 합니다.

#### 자동 설정 (권장)

```bash
# 설정 스크립트 실행
chmod +x setup.sh
./setup.sh
```

#### 수동 설정

```bash
# 설정 파일 복사
cp docker-compose.yml.example docker-compose.yml
cp src/main/resources/application.properties.example src/main/resources/application.properties
cp src/main/resources/application-docker.properties.example src/main/resources/application-docker.properties

# 각 파일에서 YOUR_PASSWORD_HERE를 원하는 MySQL 비밀번호로 변경
vi docker-compose.yml
vi src/main/resources/application.properties
vi src/main/resources/application-docker.properties
```

### 3. 실행

#### Docker 사용 (권장)

```bash
# 빌드
./mvnw clean package -DskipTests

# 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f app
```

#### 로컬 실행

```bash
# MySQL이 설치되고 실행 중이어야 합니다
./mvnw clean package
java -jar target/demo-0.0.1-SNAPSHOT.jar
```

### 4. 접속 확인

- 메인 페이지: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html
- API 테스트: `curl http://localhost:8080/api/map/markers`

## 📚 상세 가이드

CentOS 10 가상머신에서 처음부터 설정하는 방법을 포함한 자세한 가이드는 [SETUP.md](SETUP.md)를 참조하세요.

## 🛠️ 기술 스택

- **Spring Boot**: 3.3.4
- **Java**: 21
- **Database**: MySQL 8.0
- **ORM**: MyBatis
- **Build Tool**: Maven
- **API Documentation**: Swagger/OpenAPI

## 📁 프로젝트 구조

```
demo/
├── src/main/java/com/example/demo/
│   ├── DemoApplication.java              # 메인 애플리케이션
│   ├── config/                            # 설정 (CORS 등)
│   └── domain/map/                        # 맵 도메인
│       ├── controller/                    # REST 컨트롤러
│       ├── dto/                           # 데이터 전송 객체
│       ├── mapper/                        # MyBatis 매퍼 인터페이스
│       └── service/                       # 비즈니스 로직
├── src/main/resources/
│   ├── mapper/                            # MyBatis XML 매퍼
│   ├── static/                            # 정적 리소스
│   ├── application.properties.example     # 설정 파일 템플릿
│   └── application-docker.properties.example
├── docker-compose.yml.example             # Docker Compose 템플릿
├── Dockerfile                             # Docker 이미지 빌드
├── create_map_markers_table.sql          # DB 초기화 스크립트
└── pom.xml                                # Maven 설정
```

## 🔌 API 엔드포인트

### 마커 관리

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/map/markers` | 모든 마커 조회 |
| GET | `/api/map/markers/{id}` | 특정 마커 조회 |
| POST | `/api/map/markers` | 새 마커 추가 |
| PUT | `/api/map/markers/{id}` | 마커 수정 |
| DELETE | `/api/map/markers/{id}` | 마커 삭제 |

자세한 API 문서는 Swagger UI를 참조하세요.

## 🔧 개발 환경 설정

### 필수 요구사항

- Java 21
- Maven 3.6+
- MySQL 8.0+ (또는 Docker)

### IDE 설정

**IntelliJ IDEA**
1. `File > Open` 으로 프로젝트 루트 디렉토리 선택
2. Maven 프로젝트로 자동 인식
3. Lombok 플러그인 설치 필요

**VS Code**
1. Java Extension Pack 설치
2. Spring Boot Extension Pack 설치
3. Lombok Annotations Support 설치

## 🐳 Docker 명령어

```bash
# 서비스 시작
docker-compose up -d

# 서비스 중지
docker-compose down

# 로그 확인
docker-compose logs -f

# 재시작
docker-compose restart

# 빌드 후 재시작
docker-compose up --build -d

# MySQL 접속
docker exec -it demo-mysql mysql -u root -p
```

## 📝 데이터베이스

### 스키마

```sql
CREATE TABLE map_markers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,
    address VARCHAR(255),
    road_address VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 초기 데이터

프로젝트는 제주도 지역의 샘플 마커 6개를 포함합니다.

## 🤝 기여

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

This project is licensed under the MIT License.

## 📞 문제 해결

문제가 발생하면 [SETUP.md](SETUP.md)의 "문제 해결" 섹션을 참조하거나 Issue를 등록해주세요.

### 자주 묻는 질문

**Q: 설정 파일이 없다고 나옵니다.**
A: `setup.sh` 스크립트를 실행하거나 `.example` 파일들을 복사하여 설정 파일을 생성하세요.

**Q: MySQL 연결에 실패합니다.**
A: `application.properties` 파일의 비밀번호와 MySQL 설정이 일치하는지 확인하세요.

**Q: 포트 8080이 이미 사용 중입니다.**
A: 다른 애플리케이션이 포트를 사용 중일 수 있습니다. `application.properties`에서 `server.port`를 변경하세요.

