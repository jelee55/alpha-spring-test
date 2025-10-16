# CentOS 10 환경에서 프로젝트 빌드 및 실행 가이드

이 가이드는 CentOS 10 가상머신에서 프로젝트를 클론한 후 빌드하고 실행하는 방법을 설명합니다.

## 사전 준비사항

- CentOS 10 가상머신
- sudo 권한
- 인터넷 연결

---

## 📋 목차

1. [빠른 시작 (Docker 사용)](#1-빠른-시작-docker-사용-권장)
2. [로컬 환경 실행 (Docker 없이)](#2-로컬-환경-실행-docker-없이)

---

## 1. 빠른 시작 (Docker 사용, 권장)

### Step 1: 필수 프로그램 설치

```bash
# 시스템 업데이트
sudo dnf update -y

# Docker 설치
sudo dnf install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER  # Docker를 sudo 없이 사용 (재로그인 필요)

# Docker Compose 설치
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Java 21 및 Maven 설치 (빌드용)
sudo dnf install -y java-21-openjdk java-21-openjdk-devel maven

# Git 설치
sudo dnf install -y git
```

### Step 2: 프로젝트 클론 및 설정 파일 생성

```bash
# 프로젝트 클론
git clone <repository-url>
cd demo

# 설정 파일 복사 (템플릿에서)
cp docker-compose.yml.example docker-compose.yml
cp src/main/resources/application.properties.example src/main/resources/application.properties
cp src/main/resources/application-docker.properties.example src/main/resources/application-docker.properties
```

### Step 3: 설정 파일 수정

```bash
# 1. docker-compose.yml 수정
vi docker-compose.yml
# YOUR_PASSWORD_HERE를 원하는 MySQL 비밀번호로 변경 (2곳)

# 2. application-docker.properties 수정
vi src/main/resources/application-docker.properties
# YOUR_PASSWORD_HERE를 docker-compose.yml과 동일한 비밀번호로 변경
```

**중요**: `docker-compose.yml`과 `application-docker.properties`의 비밀번호를 동일하게 설정해야 합니다!

### Step 4: 빌드 및 실행

```bash
# 1. Maven으로 프로젝트 빌드
./mvnw clean package -DskipTests

# 2. Docker Compose로 실행
docker-compose up -d

# 3. 로그 확인
docker-compose logs -f app
```

### Step 5: 방화벽 설정 (선택사항)

```bash
sudo firewall-cmd --permanent --add-port=8080/tcp
sudo firewall-cmd --permanent --add-port=3306/tcp
sudo firewall-cmd --reload
```

### Step 6: 접속 확인

```bash
# API 테스트
curl http://localhost:8080/api/map/markers

# 헬스체크
curl http://localhost:8080/actuator/health
```

브라우저에서:
- 메인 페이지: `http://<가상머신-IP>:8080`
- Swagger UI: `http://<가상머신-IP>:8080/swagger-ui.html`

### Docker 관리 명령어

```bash
# 서비스 중지
docker-compose down

# 서비스 재시작
docker-compose restart

# 로그 확인
docker-compose logs -f

# 컨테이너 상태 확인
docker-compose ps

# 데이터베이스 직접 접속
docker exec -it demo-mysql mysql -u root -p
```

---

## 2. 로컬 환경 실행 (Docker 없이)

### Step 1: 필수 프로그램 설치

```bash
# 시스템 업데이트
sudo dnf update -y

# Java 21 설치
sudo dnf install -y java-21-openjdk java-21-openjdk-devel

# Maven 설치
sudo dnf install -y maven

# MySQL 설치
sudo dnf install -y mysql-server
sudo systemctl start mysqld
sudo systemctl enable mysqld

# Git 설치
sudo dnf install -y git
```

### Step 2: MySQL 설정

```bash
# MySQL 초기 비밀번호 확인 (MySQL 8.0의 경우)
sudo grep 'temporary password' /var/log/mysqld.log

# MySQL 보안 설정
sudo mysql_secure_installation

# MySQL 접속
mysql -u root -p

# MySQL에서 실행:
CREATE DATABASE test;
EXIT;
```

### Step 3: 프로젝트 클론 및 설정

```bash
# 프로젝트 클론
git clone <repository-url>
cd demo

# 설정 파일 복사
cp src/main/resources/application.properties.example src/main/resources/application.properties

# application.properties 수정
vi src/main/resources/application.properties
# YOUR_PASSWORD_HERE를 MySQL root 비밀번호로 변경
```

### Step 4: 데이터베이스 초기화

```bash
# SQL 스크립트 실행
mysql -u root -p test < create_map_markers_table.sql

# 데이터 확인
mysql -u root -p test -e "SELECT * FROM map_markers;"
```

### Step 5: 빌드 및 실행

```bash
# 빌드
./mvnw clean package

# 실행
java -jar target/demo-0.0.1-SNAPSHOT.jar

# 또는 Maven으로 직접 실행
./mvnw spring-boot:run
```

### Step 6: 방화벽 설정 (선택사항)

```bash
sudo firewall-cmd --permanent --add-port=8080/tcp
sudo firewall-cmd --reload
```

### Step 7: 접속 확인

```bash
# API 테스트
curl http://localhost:8080/api/map/markers

# 헬스체크
curl http://localhost:8080/actuator/health
```

---

## 🔧 문제 해결

### Docker 사용 시

**문제: 컨테이너가 시작되지 않음**
```bash
# 로그 확인
docker-compose logs mysql
docker-compose logs app

# 컨테이너 재빌드
docker-compose down
docker-compose up --build -d
```

**문제: MySQL 연결 실패**
```bash
# MySQL 컨테이너 상태 확인
docker-compose ps

# MySQL 로그 확인
docker-compose logs mysql

# MySQL 컨테이너 직접 접속하여 테스트
docker exec -it demo-mysql mysql -u root -pYOUR_PASSWORD_HERE test
```

### 로컬 실행 시

**문제: Permission denied for ./mvnw**
```bash
chmod +x mvnw
```

**문제: MySQL 연결 실패**
```bash
# MySQL 서비스 상태 확인
sudo systemctl status mysqld

# 방화벽 확인
sudo firewall-cmd --list-all

# MySQL 접속 테스트
mysql -u root -p -h localhost test
```

**문제: 포트 8080이 이미 사용 중**
```bash
# 포트 사용 중인 프로세스 확인
sudo lsof -i :8080

# 또는
sudo netstat -tulpn | grep 8080
```

---

## 📚 추가 정보

### API 엔드포인트

- `GET /api/map/markers` - 모든 마커 조회
- `POST /api/map/markers` - 새 마커 추가
- `GET /api/map/markers/{id}` - 특정 마커 조회
- `PUT /api/map/markers/{id}` - 마커 수정
- `DELETE /api/map/markers/{id}` - 마커 삭제

### 프로젝트 구조

```
demo/
├── src/
│   ├── main/
│   │   ├── java/com/example/demo/
│   │   │   ├── DemoApplication.java          # 메인 애플리케이션
│   │   │   ├── config/                        # 설정 클래스
│   │   │   └── domain/map/                    # 맵 관련 도메인
│   │   │       ├── controller/                # REST 컨트롤러
│   │   │       ├── dto/                       # 데이터 전송 객체
│   │   │       ├── mapper/                    # MyBatis 매퍼
│   │   │       └── service/                   # 비즈니스 로직
│   │   └── resources/
│   │       ├── mapper/                        # MyBatis XML 매퍼
│   │       ├── static/                        # 정적 파일
│   │       ├── application.properties         # 설정 파일 (gitignore)
│   │       └── application-docker.properties  # Docker용 설정 (gitignore)
│   └── test/                                  # 테스트 코드
├── docker-compose.yml                         # Docker Compose 설정 (gitignore)
├── Dockerfile                                 # Docker 이미지 빌드 설정
├── create_map_markers_table.sql              # DB 초기화 스크립트
├── pom.xml                                    # Maven 설정
└── SETUP.md                                   # 이 파일
```

### 기술 스택

- **Spring Boot**: 3.3.4
- **Java**: 21
- **Database**: MySQL 8.0
- **ORM**: MyBatis
- **Build Tool**: Maven
- **API Documentation**: Swagger/OpenAPI

---

## 💡 팁

1. **Docker 사용 시**: 데이터는 Docker Volume에 저장되므로 컨테이너를 재시작해도 데이터가 유지됩니다.
2. **보안**: 프로덕션 환경에서는 강력한 비밀번호를 사용하세요.
3. **로그**: 문제 발생 시 로그를 먼저 확인하세요.
4. **백업**: 중요한 데이터는 정기적으로 백업하세요.

---

## 📞 지원

문제가 발생하면 다음을 확인하세요:
1. 모든 필수 프로그램이 설치되었는지
2. 설정 파일의 비밀번호가 올바른지
3. 방화벽 설정이 올바른지
4. 로그 파일에 오류 메시지가 있는지

