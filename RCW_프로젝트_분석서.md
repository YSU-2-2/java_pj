# RCW 프로젝트 분석서
## Real-time Collaborative Whiteboard

---

**제목**: RCW 프로젝트 분석서
**제출 일자**: 2025-11-22
**팀명**: DrawGather
**팀원**: 김기연(팀장), 김태현, 김찬영, 장윤서

---

## 1. 프로젝트 개요

### 1.1 프로젝트 명
**RCW (Real-time Collaborative Whiteboard)** - 실시간 협업 화이트보드

### 1.2 프로젝트 목적
여러 사용자가 동시에 접속하여 하나의 캔버스에 실시간으로 그림을 그리고 협업할 수 있는 데스크톱 애플리케이션을 개발하여, 클라우드 기반의 실시간 동기화 및 데이터 저장 기술을 학습하고 구현한다.

### 1.3 핵심 개념
- 다중 사용자가 동일한 화이트보드에 동시 접속
- WebSocket을 통한 실시간 드로잉 데이터 동기화
- AWS 클라우드 서비스(RDS, S3)를 활용한 데이터 관리

---

## 2. 기술 스택

### 2.1 Frontend
- **Java Swing**: 데스크톱 GUI 애플리케이션 개발
- **용도**: 사용자 인터페이스, 캔버스 드로잉, WebSocket 클라이언트

### 2.2 Backend
- **Spring Boot**: RESTful API 및 WebSocket 서버
- **WebSocket (STOMP)**: 실시간 양방향 통신
- **용도**: 사용자 인증, 실시간 메시지 브로커, 이미지 저장 관리

### 2.3 Database
- **AWS RDS (MySQL)**: 관계형 데이터베이스
- **용도**: 사용자 정보, 방 정보, 저장된 그림 메타데이터 관리

### 2.4 Storage
- **AWS S3**: 객체 스토리지
- **용도**: 완성된 화이트보드 이미지(PNG) 파일 저장

---

## 3. 시스템 아키텍처

### 3.1 전체 구조
```
[Java Swing Client] <--HTTP/WebSocket--> [Spring Boot Server] <--> [AWS RDS]
                                                  |
                                                  v
                                              [AWS S3]
```

### 3.2 통신 프로토콜
- **HTTP/HTTPS**: 로그인, 회원가입, 이미지 저장 요청
- **WebSocket (STOMP)**: 실시간 드로잉 데이터 전송

---

## 4. 주요 기능 상세 분석

### 4.1 회원가입 기능

#### 4.1.1 기능 개요
새로운 사용자가 시스템에 계정을 생성하는 기능

#### 4.1.2 입력
- **사용자명 (username)**: 로그인 ID (영문/숫자, 4-20자)
- **비밀번호 (password)**: 로그인 비밀번호 (8자 이상)
- **닉네임 (nickname)**: 화이트보드에 표시될 이름 (2-10자)

#### 4.1.3 처리 과정
1. 클라이언트: 회원가입 폼에 정보 입력
2. 입력 유효성 검증 (필수 항목, 형식 검증)
3. 서버로 POST 요청 전송 (`/api/auth/signup`)
4. 서버: username 중복 확인 (RDS 조회)
5. 비밀번호 암호화 (BCrypt)
6. RDS `users` 테이블에 신규 사용자 정보 저장
7. 성공/실패 응답 반환

#### 4.1.4 출력
- **성공**: "회원가입이 완료되었습니다" 메시지, 로그인 화면으로 이동
- **실패**:
  - "이미 존재하는 아이디입니다" (중복 username)
  - "입력 형식이 올바르지 않습니다" (유효성 검증 실패)

#### 4.1.5 데이터베이스 변경
```sql
INSERT INTO users (username, password, nickname)
VALUES ('user123', '$2a$10$encrypted...', '홍길동');
```

---

### 4.2 로그인 기능

#### 4.2.1 기능 개요
등록된 사용자가 인증하여 시스템에 접근하는 기능

#### 4.2.2 입력
- **사용자명 (username)**: 등록된 ID
- **비밀번호 (password)**: 등록된 비밀번호

#### 4.2.3 처리 과정
1. 클라이언트: 로그인 폼에 인증 정보 입력
2. 서버로 POST 요청 전송 (`/api/auth/login`)
3. 서버: RDS에서 username 조회
4. 비밀번호 검증 (BCrypt 비교)
5. 인증 성공 시 세션 토큰 또는 사용자 정보 반환
6. 성공/실패 응답 전송

#### 4.2.4 출력
- **성공**:
  - 사용자 정보 (user_id, nickname) 반환
  - 방 목록/생성 화면으로 이동
- **실패**:
  - "아이디 또는 비밀번호가 일치하지 않습니다" 에러 메시지

#### 4.2.5 결과 형태
```json
{
  "userId": 1,
  "username": "user123",
  "nickname": "홍길동"
}
```

---

### 4.3 방 생성 기능

#### 4.3.1 기능 개요
새로운 협업 화이트보드 세션(방)을 생성하는 기능

#### 4.3.2 입력
- **생성 요청**: 로그인한 사용자의 "방 만들기" 버튼 클릭

#### 4.3.3 처리 과정
1. 클라이언트: 방 생성 버튼 클릭
2. 서버로 POST 요청 전송 (`/api/rooms/create`)
3. 서버: 고유한 방 코드(room_code) 생성 (예: 6자리 랜덤 문자열)
4. RDS `rooms` 테이블에 새 방 정보 저장
5. 생성된 방 코드 반환

#### 4.3.4 출력
- **생성된 방 코드**: "ABC123" (6자리 영문/숫자 조합)
- **화면 전환**: 해당 방 코드의 화이트보드 캔버스 화면으로 자동 입장

#### 4.3.5 데이터베이스 변경
```sql
INSERT INTO rooms (room_code, created_at)
VALUES ('ABC123', NOW());
```

---

### 4.4 방 입장 기능

#### 4.4.1 기능 개요
기존에 생성된 방에 참여하는 기능

#### 4.4.2 입력
- **방 코드 (room_code)**: 참여하려는 방의 고유 코드 (예: "ABC123")

#### 4.4.3 처리 과정
1. 클라이언트: 방 코드 입력 폼에 코드 입력
2. 서버로 GET 요청 전송 (`/api/rooms/{room_code}`)
3. 서버: RDS에서 해당 room_code 존재 여부 확인
4. 유효한 방인 경우 방 정보 반환
5. 클라이언트: 화이트보드 캔버스 화면으로 이동 및 WebSocket 연결

#### 4.4.4 출력
- **성공**: 화이트보드 캔버스 화면 표시, 실시간 동기화 시작
- **실패**: "존재하지 않는 방 코드입니다" 에러 메시지

---

### 4.5 실시간 드로잉 기능

#### 4.5.1 기능 개요
여러 사용자가 동시에 캔버스에 그림을 그리고, 모든 참여자에게 실시간으로 동기화하는 핵심 기능

#### 4.5.2 입력
- **마우스 이벤트**:
  - 마우스 드래그 (Drawing)
  - 시작 좌표 (x1, y1)
  - 종료 좌표 (x2, y2)
- **도구 선택**:
  - 펜 (기본)
  - 지우개
- **색상 선택**: 5가지 색상 (검정, 빨강, 파랑, 초록, 노랑)

#### 4.5.3 처리 과정
1. **로컬 렌더링**:
   - 사용자가 마우스로 캔버스에 드래그
   - 즉시 로컬 화면에 선 그리기

2. **WebSocket 전송**:
   - 드로잉 데이터 객체 생성:
     ```json
     {
       "type": "DRAW",
       "roomCode": "ABC123",
       "userId": 1,
       "nickname": "홍길동",
       "x1": 100,
       "y1": 150,
       "x2": 105,
       "y2": 155,
       "color": "#FF0000",
       "tool": "PEN"
     }
     ```
   - STOMP 프로토콜로 서버에 publish (`/app/draw`)

3. **서버 브로드캐스트**:
   - 서버: 해당 방(ABC123)에 구독 중인 모든 클라이언트에게 메시지 전달
   - 구독 경로: `/topic/room/{roomCode}`

4. **타 사용자 수신 및 렌더링**:
   - 다른 클라이언트들이 WebSocket 메시지 수신
   - 수신한 좌표와 색상으로 각자의 캔버스에 동일한 선 그리기

#### 4.5.4 출력
- **로컬 화면**: 즉시 그림 반영 (지연 없음)
- **타 사용자 화면**: 네트워크 지연 고려 시 ~100ms 이내 동기화
- **시각적 결과**: 모든 사용자가 동일한 캔버스 상태 공유

#### 4.5.5 동기화 메커니즘
```
[User A 드로잉]
    ↓ WebSocket
[Spring Boot Server - Message Broker]
    ↓ Broadcast
[User B, C, D 캔버스 업데이트]
```

---

### 4.6 지우개 기능

#### 4.6.1 기능 개요
캔버스의 특정 영역을 지우는 기능

#### 4.6.2 입력
- **도구 선택**: 지우개 선택
- **마우스 드래그**: 지울 영역 (x1, y1) → (x2, y2)

#### 4.6.3 처리 과정
1. 지우개 도구로 전환
2. 드래그 시 흰색(또는 배경색)으로 선 그리기
3. 드로잉과 동일하게 WebSocket으로 전송 (tool: "ERASER")
4. 모든 사용자에게 동기화

#### 4.6.4 출력
- 해당 영역이 배경색으로 덮어씌워짐 (시각적으로 지워진 효과)

---

### 4.7 이미지 저장 기능

#### 4.7.1 기능 개요
완성된 화이트보드를 PNG 이미지 파일로 저장하고, AWS S3에 업로드하는 기능

#### 4.7.2 입력
- **저장 버튼 클릭**: 사용자가 "저장" 버튼 클릭
- **현재 캔버스 상태**: Java Swing 캔버스의 픽셀 데이터

#### 4.7.3 처리 과정
1. **캔버스 이미지화**:
   - Java Swing 캔버스를 BufferedImage 객체로 변환
   - PNG 포맷으로 인코딩

2. **서버 전송**:
   - POST 요청으로 이미지 데이터 전송 (`/api/drawings/save`)
   - 요청 바디: Multipart form-data (image file, room_code, user_id)

3. **S3 업로드**:
   - 서버: 고유 파일명 생성 (예: `room_ABC123_20251122_143025.png`)
   - AWS S3 버킷에 이미지 업로드
   - S3 객체 URL 획득 (예: `https://rcw-bucket.s3.amazonaws.com/room_ABC123_...png`)

4. **메타데이터 저장**:
   - RDS `saved_drawings` 테이블에 저장 정보 기록:
     ```sql
     INSERT INTO saved_drawings (room_code, user_id, s3_url, created_at)
     VALUES ('ABC123', 1, 'https://...png', NOW());
     ```

5. **응답 반환**:
   - 저장 성공 메시지 및 S3 URL 반환

#### 4.7.4 출력
- **성공 메시지**: "이미지가 저장되었습니다"
- **S3 URL**: `https://rcw-bucket.s3.amazonaws.com/room_ABC123_20251122_143025.png`
- **데이터베이스 레코드**: saved_drawings 테이블에 1개 행 추가

#### 4.7.5 결과 형태
```json
{
  "message": "Image saved successfully",
  "drawingId": 42,
  "s3Url": "https://rcw-bucket.s3.amazonaws.com/room_ABC123_20251122_143025.png"
}
```

---

### 4.8 저장된 이미지 조회 기능

#### 4.8.1 기능 개요
사용자가 이전에 저장한 화이트보드 이미지 목록을 조회하는 기능

#### 4.8.2 입력
- **사용자 ID**: 로그인한 사용자의 고유 ID
- **조회 요청**: "내 그림 보기" 버튼 클릭

#### 4.8.3 처리 과정
1. 클라이언트: GET 요청 전송 (`/api/drawings/user/{userId}`)
2. 서버: RDS `saved_drawings` 테이블에서 해당 user_id로 필터링
3. 저장된 그림 목록 조회 (최신순 정렬)
4. 목록 반환 (drawing_id, room_code, s3_url, created_at)

#### 4.8.4 출력
- **그림 목록**:
  ```json
  [
    {
      "drawingId": 42,
      "roomCode": "ABC123",
      "s3Url": "https://...png",
      "createdAt": "2025-11-22 14:30:25"
    },
    {
      "drawingId": 35,
      "roomCode": "XYZ789",
      "s3Url": "https://...png",
      "createdAt": "2025-11-21 10:15:00"
    }
  ]
  ```
- **UI 표시**: 썸네일 또는 목록 형태로 표시, 클릭 시 이미지 다운로드 또는 새 창에서 보기

---

## 5. 데이터베이스 설계

### 5.1 users 테이블
사용자 계정 정보 저장

| 컬럼명      | 데이터 타입        | 제약 조건           | 설명                |
|------------|-------------------|---------------------|---------------------|
| id         | BIGINT            | PRIMARY KEY, AUTO_INCREMENT | 사용자 고유 ID       |
| username   | VARCHAR(50)       | UNIQUE, NOT NULL    | 로그인 아이디        |
| password   | VARCHAR(255)      | NOT NULL            | 암호화된 비밀번호     |
| nickname   | VARCHAR(50)       | NOT NULL            | 화이트보드 표시 이름  |
| created_at | TIMESTAMP         | DEFAULT NOW()       | 계정 생성 시각       |

### 5.2 rooms 테이블
화이트보드 방 정보 저장

| 컬럼명      | 데이터 타입        | 제약 조건           | 설명                |
|------------|-------------------|---------------------|---------------------|
| id         | BIGINT            | PRIMARY KEY, AUTO_INCREMENT | 방 고유 ID          |
| room_code  | VARCHAR(10)       | UNIQUE, NOT NULL    | 방 참여 코드         |
| created_at | TIMESTAMP         | DEFAULT NOW()       | 방 생성 시각         |

### 5.3 saved_drawings 테이블
저장된 화이트보드 이미지 메타데이터

| 컬럼명      | 데이터 타입        | 제약 조건           | 설명                |
|------------|-------------------|---------------------|---------------------|
| id         | BIGINT            | PRIMARY KEY, AUTO_INCREMENT | 저장 레코드 ID       |
| room_code  | VARCHAR(10)       | NOT NULL            | 해당 방 코드         |
| user_id    | BIGINT            | FOREIGN KEY(users.id) | 저장한 사용자 ID    |
| s3_url     | VARCHAR(500)      | NOT NULL            | S3 저장 URL         |
| created_at | TIMESTAMP         | DEFAULT NOW()       | 저장 시각           |

---

## 6. API 명세

### 6.1 인증 API

#### 6.1.1 회원가입
- **Endpoint**: `POST /api/auth/signup`
- **Request Body**:
  ```json
  {
    "username": "user123",
    "password": "password123",
    "nickname": "홍길동"
  }
  ```
- **Response**:
  - 성공 (201): `{"message": "User registered successfully"}`
  - 실패 (400): `{"error": "Username already exists"}`

#### 6.1.2 로그인
- **Endpoint**: `POST /api/auth/login`
- **Request Body**:
  ```json
  {
    "username": "user123",
    "password": "password123"
  }
  ```
- **Response**:
  - 성공 (200):
    ```json
    {
      "userId": 1,
      "username": "user123",
      "nickname": "홍길동"
    }
    ```
  - 실패 (401): `{"error": "Invalid credentials"}`

---

### 6.2 방 관리 API

#### 6.2.1 방 생성
- **Endpoint**: `POST /api/rooms/create`
- **Request Body**: (없음 또는 빈 객체)
- **Response**:
  - 성공 (201):
    ```json
    {
      "roomCode": "ABC123"
    }
    ```

#### 6.2.2 방 조회
- **Endpoint**: `GET /api/rooms/{room_code}`
- **Response**:
  - 성공 (200):
    ```json
    {
      "roomCode": "ABC123",
      "createdAt": "2025-11-22T10:30:00"
    }
    ```
  - 실패 (404): `{"error": "Room not found"}`

---

### 6.3 드로잉 저장 API

#### 6.3.1 이미지 저장
- **Endpoint**: `POST /api/drawings/save`
- **Request**: Multipart form-data
  - `image`: PNG 파일
  - `roomCode`: 방 코드
  - `userId`: 사용자 ID
- **Response**:
  - 성공 (200):
    ```json
    {
      "drawingId": 42,
      "s3Url": "https://rcw-bucket.s3.amazonaws.com/..."
    }
    ```

#### 6.3.2 사용자 그림 조회
- **Endpoint**: `GET /api/drawings/user/{userId}`
- **Response**:
  - 성공 (200):
    ```json
    [
      {
        "drawingId": 42,
        "roomCode": "ABC123",
        "s3Url": "https://...",
        "createdAt": "2025-11-22T14:30:25"
      }
    ]
    ```

---

### 6.4 WebSocket (STOMP) 명세

#### 6.4.1 연결
- **Endpoint**: `ws://server-url/ws`
- **Protocol**: STOMP over WebSocket

#### 6.4.2 구독 (Subscribe)
- **Destination**: `/topic/room/{roomCode}`
- **설명**: 특정 방의 실시간 드로잉 메시지 수신

#### 6.4.3 발행 (Publish)
- **Destination**: `/app/draw`
- **Message Body**:
  ```json
  {
    "type": "DRAW",
    "roomCode": "ABC123",
    "userId": 1,
    "nickname": "홍길동",
    "x1": 100,
    "y1": 150,
    "x2": 105,
    "y2": 155,
    "color": "#FF0000",
    "tool": "PEN"
  }
  ```

---

## 7. 사용자 시나리오

### 7.1 시나리오 1: 새 사용자 등록 및 첫 드로잉

1. **회원가입**:
   - 입력: username="alice", password="pass1234", nickname="앨리스"
   - 출력: "회원가입 완료" → 로그인 화면

2. **로그인**:
   - 입력: username="alice", password="pass1234"
   - 출력: 사용자 정보 수신 → 메인 화면

3. **방 생성**:
   - 입력: "방 만들기" 버튼 클릭
   - 출력: room_code="ABC123" → 캔버스 화면

4. **드로잉**:
   - 입력: 빨간색 펜으로 (50,50) → (200,200) 드래그
   - 출력: 로컬 캔버스에 빨간 선 표시

5. **이미지 저장**:
   - 입력: "저장" 버튼 클릭
   - 출력: S3 URL 수신, "저장 완료" 메시지

---

### 7.2 시나리오 2: 다중 사용자 협업

1. **User A (Alice)**:
   - 방 생성 → room_code="XYZ789"
   - 파란색 펜으로 원 그리기

2. **User B (Bob)**:
   - 방 입장 → room_code="XYZ789" 입력
   - Alice가 그린 원이 이미 캔버스에 표시됨
   - 초록색 펜으로 사각형 추가

3. **실시간 동기화**:
   - Alice의 화면: Bob이 그린 사각형이 실시간으로 나타남
   - Bob의 화면: Alice가 추가로 그리는 선이 실시간 표시

4. **공동 저장**:
   - Alice가 "저장" 클릭 → Alice 계정에 이미지 저장
   - Bob도 "저장" 클릭 → Bob 계정에 동일한 이미지 저장

---

## 8. 시스템 제약사항 및 가정

### 8.1 제약사항
- 동시 접속 사용자: 방당 최대 10명 (성능 고려)
- 캔버스 크기: 800x600 픽셀 고정
- 저장 이미지 포맷: PNG만 지원
- 네트워크: 인터넷 연결 필수 (오프라인 미지원)

### 8.2 가정
- 사용자는 안정적인 인터넷 연결 환경
- AWS RDS 및 S3 서비스 정상 작동
- 클라이언트 PC에 Java 11 이상 설치

---

## 9. 성공 기준

### 9.1 기능적 요구사항
- ✅ 2명 이상이 동시에 한 방에 접속하여 실시간으로 그림 공유
- ✅ 로그인/회원가입이 정상적으로 작동
- ✅ 완성된 그림이 S3에 저장되고, URL이 RDS에 기록
- ✅ AWS RDS와 S3 모두 사용

### 9.2 비기능적 요구사항
- **응답 시간**: 드로잉 동기화 지연 100ms 이내
- **가용성**: 서버 가동률 99% 이상
- **보안**: 비밀번호 암호화 저장 (BCrypt)

---

## 10. 향후 확장 가능성

### 10.1 추가 기능 아이디어
- 다양한 도구: 도형(원, 사각형, 직선), 텍스트 입력
- 레이어 기능: 여러 레이어로 복잡한 그림 구성
- 채팅 기능: 음성/텍스트 채팅으로 협업 강화
- 버전 관리: 그림의 히스토리 저장 및 롤백

### 10.2 기술적 개선
- WebRTC 도입: 더 낮은 지연 시간
- Redis 캐싱: 방 세션 정보 캐싱으로 성능 향상
- 모바일 앱: Android/iOS 클라이언트 개발

---

## 11. 결론

RCW 프로젝트는 Java Swing 데스크톱 클라이언트와 Spring Boot 백엔드, AWS 클라우드 서비스를 결합하여 실시간 협업 화이트보드를 구현합니다. WebSocket을 통한 실시간 동기화, RDS를 통한 데이터 관리, S3를 통한 이미지 저장의 3대 핵심 기능을 통해 다중 사용자가 동시에 하나의 캔버스에서 협업할 수 있는 환경을 제공합니다.

본 프로젝트를 통해 클라우드 컴퓨팅의 핵심 개념인 확장 가능한 백엔드 아키텍처, 실시간 데이터 동기화, 클라우드 스토리지 활용을 실습하고, 협업 소프트웨어 개발 경험을 쌓을 수 있습니다.

---

**문서 작성일**: 2025-11-22
**버전**: 1.0
**작성자**: DrawGather 팀
