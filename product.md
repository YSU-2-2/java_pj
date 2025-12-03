# 클라우드 드로잉 프로그램 개발 계획서

## 1. 프로젝트 개요
- 실시간 협업 드로잉 & 메모 공유 애플리케이션
- Spring Boot + WebSocket + MongoDB + AWS S3 기반
- 다중 사용자가 동시에 한 캔버스에 그림을 그리고 실시간으로 공유

## 2. 기술 스택
### Backend
- Java 17+
- Spring Boot 3.x
- Spring WebSocket (STOMP)
- Spring Data MongoDB
- AWS SDK for Java (S3)

### Frontend
- HTML5 Canvas API
- JavaScript (Vanilla or React)
- SockJS + STOMP Client

### Database & Storage
- MongoDB (사용자, 방, 드로잉 데이터)
- AWS S3 (이미지 저장)

## 3. 개발 단계별 구현 순서

### Phase 1: 프로젝트 초기 설정 (1-2일)
1. Spring Boot 프로젝트 생성
   - Spring Initializr로 기본 프로젝트 생성
   - Dependencies: Web, WebSocket, MongoDB, Lombok, Validation
2. MongoDB 연결 설정
   - application.yml에 MongoDB 설정 추가
   - 로컬 MongoDB 설치 및 테스트
3. AWS S3 설정
   - AWS 계정 생성 및 S3 버킷 생성
   - IAM 사용자 생성 및 권한 설정
   - AWS SDK 의존성 추가 및 설정

### Phase 2: 사용자 인증 시스템 구현 (2-3일)
4. User 엔티티 설계
   - id, username, password(암호화), email, createdAt
5. 회원가입 API 구현
   - POST /api/auth/register
   - 비밀번호 BCrypt 암호화
6. 로그인 API 구현
   - POST /api/auth/login
   - JWT 토큰 발급 (선택) 또는 세션 기반 인증
7. 로그인 확인 미들웨어/인터셉터 구현

### Phase 3: 방 생성 및 관리 기능 (2-3일)
8. Room 엔티티 설계
   - id, roomName, createdBy, participants[], createdAt, isActive
9. 방 생성 API
   - POST /api/rooms
   - 방 이름, 생성자 정보 저장
10. 방 목록 조회 API
    - GET /api/rooms
    - 활성화된 방 목록 반환
11. 방 입장/퇴장 API
    - POST /api/rooms/{roomId}/join
    - POST /api/rooms/{roomId}/leave
12. 방 삭제 API
    - DELETE /api/rooms/{roomId}

### Phase 4: WebSocket 실시간 통신 구현 (3-4일)
13. WebSocket 설정
    - WebSocketConfig 클래스 생성
    - STOMP 엔드포인트 설정 (/ws)
    - Message Broker 설정
14. Drawing 데이터 모델 정의
    - DrawingData: type(line, circle, rect), coordinates, color, strokeWidth
15. WebSocket 메시지 핸들러 구현
    - @MessageMapping("/draw")
    - 클라이언트에서 받은 드로잉 데이터를 같은 방의 모든 사용자에게 브로드캐스트
16. 방별 메시지 라우팅
    - /topic/room/{roomId} 구독 패턴 사용
17. 사용자 연결/해제 이벤트 처리
    - SessionConnectedEvent, SessionDisconnectEvent 리스너 구현

### Phase 5: 캔버스 기능 구현 (3-4일)
18. HTML5 Canvas 기본 설정
    - canvas 요소 생성 및 크기 설정
19. 드로잉 도구 구현
    - 펜/브러시 도구 (자유 곡선)
    - 선 그리기
    - 사각형, 원 그리기
    - 지우개 도구
20. 색상 선택기 구현
    - Color picker UI
21. 선 두께 조절 기능
22. 실시간 드로잉 동기화
    - 로컬에서 그린 내용을 WebSocket으로 전송
    - 다른 사용자의 드로잉 데이터를 받아서 캔버스에 렌더링

### Phase 6: 메모 기능 구현 (2일)
23. Memo 엔티티 설계
    - id, roomId, userId, content, x, y, createdAt
24. 메모 생성/수정/삭제 API
    - POST /api/memos
    - PUT /api/memos/{memoId}
    - DELETE /api/memos/{memoId}
25. 실시간 메모 동기화
    - WebSocket을 통한 메모 생성/수정/삭제 이벤트 브로드캐스트
26. 메모 UI 구현
    - 드래그 가능한 메모 위젯
    - 메모 내용 편집 기능

### Phase 7: 이미지 저장 기능 (AWS S3) (2-3일)
27. S3Service 클래스 구현
    - AWS SDK를 사용한 파일 업로드 메서드
    - 파일명 중복 방지 (UUID 사용)
28. Canvas 저장 API
    - POST /api/canvas/save
    - Canvas 데이터를 이미지(PNG)로 변환
    - S3에 업로드 후 URL 반환
29. Canvas 불러오기 API
    - GET /api/canvas/{roomId}
    - S3에서 이미지 URL 조회 후 반환
30. Drawing 데이터 MongoDB 저장
    - DrawingHistory 컬렉션에 모든 드로잉 액션 저장
    - 방 재입장 시 기존 드로잉 복원

### Phase 8: 프론트엔드 통합 (3-4일)
31. 로그인/회원가입 페이지
    - 폼 Validation
    - API 호출 및 토큰/세션 저장
32. 방 목록 페이지
    - 방 생성 버튼 및 모달
    - 방 목록 렌더링
    - 방 입장 기능
33. 캔버스 페이지
    - WebSocket 연결
    - 드로잉 도구 UI
    - 실시간 동기화 로직
34. 메모 위젯 구현
35. 저장/불러오기 버튼
    - Canvas를 S3에 저장
    - 저장된 이미지 불러오기

### Phase 9: 추가 기능 및 개선 (2-3일)
36. 실행 취소(Undo)/다시 실행(Redo) 기능
37. 전체 캔버스 지우기 기능
38. 참여자 목록 표시
    - 현재 방에 접속한 사용자 목록
39. 커서 위치 공유
    - 다른 사용자의 마우스 커서 위치 표시
40. 에러 처리 및 예외 핸들링
    - Global Exception Handler
    - WebSocket 재연결 로직

### Phase 10: 테스트 및 배포 (2-3일)
41. 단위 테스트 작성
    - Service 레이어 테스트
42. 통합 테스트
    - API 엔드포인트 테스트
    - WebSocket 연결 테스트
43. 프론트엔드 빌드 최적화
44. Docker 컨테이너화 (선택)
    - Dockerfile 작성
    - docker-compose.yml 작성
45. AWS EC2 또는 클라우드 플랫폼에 배포
    - 환경 변수 설정
    - MongoDB Atlas 사용 (또는 EC2에 MongoDB 설치)
46. 성능 테스트
    - 동시 접속자 테스트
    - 네트워크 지연 테스트

## 4. 데이터베이스 스키마

### users 컬렉션
```
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String (hashed),
  createdAt: Date
}
```

### rooms 컬렉션
```
{
  _id: ObjectId,
  roomName: String,
  createdBy: ObjectId (User),
  participants: [ObjectId],
  isActive: Boolean,
  createdAt: Date
}
```

### drawings 컬렉션
```
{
  _id: ObjectId,
  roomId: ObjectId,
  userId: ObjectId,
  drawingData: {
    type: String,
    coordinates: Array,
    color: String,
    strokeWidth: Number
  },
  createdAt: Date
}
```

### memos 컬렉션
```
{
  _id: ObjectId,
  roomId: ObjectId,
  userId: ObjectId,
  content: String,
  position: { x: Number, y: Number },
  createdAt: Date,
  updatedAt: Date
}
```

## 5. 핵심 고려사항
- WebSocket 연결 안정성 (재연결 로직)
- 대용량 드로잉 데이터 처리 (throttling, debouncing)
- S3 업로드 비용 최적화
- MongoDB 인덱싱 전략 (roomId, userId)
- CORS 설정
- 보안 (XSS, CSRF 방지)

## 6. 예상 개발 기간
총 20-30일 (약 4-6주)
