#!/bin/bash

# CentOS 10 환경에서 프로젝트 설정을 자동화하는 스크립트

set -e  # 오류 발생 시 스크립트 중단

echo "========================================"
echo "Demo 프로젝트 초기 설정 스크립트"
echo "========================================"
echo ""

# 설정 파일이 이미 존재하는지 확인
check_file_exists() {
    if [ -f "$1" ]; then
        echo "⚠️  $1 파일이 이미 존재합니다."
        read -p "덮어쓰시겠습니까? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            return 1
        fi
    fi
    return 0
}

# 1. docker-compose.yml 생성
echo "📝 Step 1: docker-compose.yml 생성"
if check_file_exists "docker-compose.yml"; then
    cp docker-compose.yml.example docker-compose.yml
    echo "✅ docker-compose.yml 생성 완료"
else
    echo "⏭️  docker-compose.yml 건너뜀"
fi
echo ""

# 2. application.properties 생성
echo "📝 Step 2: application.properties 생성"
if check_file_exists "src/main/resources/application.properties"; then
    cp src/main/resources/application.properties.example src/main/resources/application.properties
    echo "✅ application.properties 생성 완료"
else
    echo "⏭️  application.properties 건너뜀"
fi
echo ""

# 3. application-docker.properties 생성
echo "📝 Step 3: application-docker.properties 생성"
if check_file_exists "src/main/resources/application-docker.properties"; then
    cp src/main/resources/application-docker.properties.example src/main/resources/application-docker.properties
    echo "✅ application-docker.properties 생성 완료"
else
    echo "⏭️  application-docker.properties 건너뜀"
fi
echo ""

# 4. 비밀번호 설정
echo "🔐 Step 4: MySQL 비밀번호 설정"
read -sp "MySQL root 비밀번호를 입력하세요: " mysql_password
echo ""

if [ -z "$mysql_password" ]; then
    echo "⚠️  비밀번호가 입력되지 않았습니다. YOUR_PASSWORD_HERE를 수동으로 변경해주세요."
else
    # docker-compose.yml 수정
    if [ -f "docker-compose.yml" ]; then
        sed -i "s/YOUR_PASSWORD_HERE/$mysql_password/g" docker-compose.yml
        echo "✅ docker-compose.yml 비밀번호 설정 완료"
    fi
    
    # application.properties 수정
    if [ -f "src/main/resources/application.properties" ]; then
        sed -i "s/YOUR_PASSWORD_HERE/$mysql_password/g" src/main/resources/application.properties
        echo "✅ application.properties 비밀번호 설정 완료"
    fi
    
    # application-docker.properties 수정
    if [ -f "src/main/resources/application-docker.properties" ]; then
        sed -i "s/YOUR_PASSWORD_HERE/$mysql_password/g" src/main/resources/application-docker.properties
        echo "✅ application-docker.properties 비밀번호 설정 완료"
    fi
fi
echo ""

# 5. mvnw 실행 권한 부여
echo "🔧 Step 5: mvnw 실행 권한 설정"
if [ -f "./mvnw" ]; then
    chmod +x ./mvnw
    echo "✅ mvnw 실행 권한 부여 완료"
fi
echo ""

# 완료 메시지
echo "========================================"
echo "✅ 초기 설정이 완료되었습니다!"
echo "========================================"
echo ""
echo "다음 단계:"
echo ""
echo "🐳 Docker로 실행:"
echo "  1. ./mvnw clean package -DskipTests"
echo "  2. docker-compose up -d"
echo "  3. docker-compose logs -f app"
echo ""
echo "💻 로컬에서 실행:"
echo "  1. MySQL 데이터베이스 생성 및 초기화"
echo "  2. ./mvnw clean package"
echo "  3. java -jar target/demo-0.0.1-SNAPSHOT.jar"
echo ""
echo "📖 자세한 내용은 SETUP.md를 참조하세요."
echo ""

