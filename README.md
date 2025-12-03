# Cloud Drawing Application

실시간 협업 드로잉 & 메모 공유 애플리케이션

## 기술 스택

### Backend
- Java 17
- Spring Boot 3.2.0
- Spring WebSocket (STOMP)
- NoSQL (MongoDB 또는 AWS DynamoDB - 선택 예정)
- AWS S3

### Frontend
- HTML5 Canvas API
- JavaScript
- WebSocket (SockJS + STOMP)

## 프로젝트 구조

```
cloud-drawing-app/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/cloudproject/drawing/
│   │   │       ├── config/          # 설정 클래스
│   │   │       ├── controller/      # REST & WebSocket 컨트롤러
│   │   │       ├── service/         # 비즈니스 로직
│   │   │       ├── repository/      # 데이터 액세스 레이어
│   │   │       ├── model/           # 엔티티/도메인 모델
│   │   │       ├── dto/             # Data Transfer Objects
│   │   │       ├── exception/       # 예외 처리
│   │   │       └── DrawingApplication.java
│   │   └── resources/
│   │       ├── application.yml
│   │       └── static/              # 정적 리소스 (HTML, CSS, JS)
│   └── test/
│       └── java/
└── build.gradle
```

## 시작하기

### 필수 요구사항
- Java 17 이상
- Gradle 8.5 이상

### 빌드 및 실행

```bash
# Gradle 빌드
./gradlew build

# 애플리케이션 실행
./gradlew bootRun
./gradlew.bat bootRun
```

서버는 기본적으로 `http://localhost:8080`에서 실행됩니다.

## 개발 계획

자세한 개발 계획은 `product.md` 파일을 참조하세요.

## NoSQL 선택

현재 MongoDB와 AWS DynamoDB 중 선택을 고민 중입니다.
선택 후 `build.gradle`과 `application.yml`에서 해당 설정의 주석을 해제하세요.
