# 클라우드 드로잉 프로그램 개발 계획서

## 📊 개발 진행 상황
**전체 진행률**: 약 60% (Phase 1-5, 7 완료)
- ✅ Phase 1: 프로젝트 초기 설정
- ✅ Phase 2: 사용자 인증 시스템
- ✅ Phase 3: 방 생성 및 관리
- ✅ Phase 4: WebSocket 실시간 통신
- ✅ Phase 5: 캔버스 기능
- ⏭️ Phase 6: 메모 기능 (건너뜀)
- ✅ Phase 7: 이미지 저장 (MongoDB 사용)
- 🔄 Phase 8: 프론트엔드 통합 (부분 완료)
- ⏳ Phase 9-10: 미구현

## 1. 프로젝트 개요
- 실시간 협업 드로잉 애플리케이션
- Spring Boot + WebSocket + MongoDB 기반
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
- MongoDB (사용자, 방, 캔버스 이미지 저장)
- ~~AWS S3 (이미지 저장)~~ → MongoDB Base64로 대체

## 3. 개발 단계별 구현 순서

### Phase 1: 프로젝트 초기 설정 ✅ (완료)
1. ✅ Spring Boot 프로젝트 생성
   - Spring Initializr로 기본 프로젝트 생성
   - Dependencies: Web, WebSocket, MongoDB, Lombok, Validation
2. ✅ MongoDB 연결 설정
   - application.yml에 MongoDB Atlas 설정 추가
   - MongoDB Atlas 클러스터 연결 완료
3. ⏭️ AWS S3 설정 (건너뜀)
   - 의존성만 추가, 설정은 주석 처리
   - MongoDB로 이미지 저장 대체

### Phase 2: 사용자 인증 시스템 구현 ✅ (완료)
4. ✅ User 엔티티 설계
   - id, username, password(암호화), email, createdAt
5. ✅ 회원가입 API 구현
   - POST /api/auth/register
   - 비밀번호 BCrypt 암호화
6. ✅ 로그인 API 구현
   - POST /api/auth/login
   - 세션 기반 인증 (JWT 미사용)
7. ⏭️ 로그인 확인 미들웨어/인터셉터 (미구현)

### Phase 3: 방 생성 및 관리 기능 ✅ (완료)
8. ✅ Room 엔티티 설계
   - id, roomName, createdBy, participants[], createdAt, isActive
9. ✅ 방 생성 API
   - POST /api/rooms
   - 방 이름, 생성자 정보 저장
10. ✅ 방 목록 조회 API
    - GET /api/rooms
    - 활성화된 방 목록 반환
11. ✅ 방 입장/퇴장 API
    - POST /api/rooms/{roomId}/join
    - POST /api/rooms/{roomId}/leave
12. ✅ 방 삭제 API (Hard Delete로 구현)
    - DELETE /api/rooms/{roomId}
    - MongoDB에서 완전 삭제

### Phase 4: WebSocket 실시간 통신 구현 ✅ (완료)
13. ✅ WebSocket 설정
    - WebSocketConfig 클래스 생성
    - STOMP 엔드포인트 설정 (/ws)
    - Message Broker 설정
14. ✅ Drawing 데이터 모델 정의
    - DrawingData: type(pen, line, circle, rect, eraser), coordinates, color, strokeWidth
15. ✅ WebSocket 메시지 핸들러 구현
    - @MessageMapping("/draw") - 드로잉 데이터 브로드캐스트
    - @MessageMapping("/chat") - 채팅 메시지
    - @MessageMapping("/join") - 입장 알림
    - @MessageMapping("/leave") - 퇴장 알림
16. ✅ 방별 메시지 라우팅
    - /topic/room/{roomId}/draw - 드로잉 구독
    - /topic/room/{roomId}/chat - 채팅 구독
17. ✅ 사용자 연결/해제 이벤트 처리
    - WebSocketEventListener 구현
    - 연결/해제 로깅

### Phase 5: 캔버스 기능 구현 ✅ (완료)
18. ✅ HTML5 Canvas 기본 설정
    - canvas 요소 생성 (1200x700)
    - 반응형 레이아웃
19. ✅ 드로잉 도구 구현
    - 펜 도구 (자유 곡선)
    - 직선 그리기
    - 사각형 그리기
    - 원 그리기
    - 지우개 도구
20. ✅ 색상 선택기 구현
    - HTML5 Color picker
21. ✅ 선 두께 조절 기능
    - Range slider (1-20)
22. ✅ 실시간 드로잉 동기화
    - WebSocket으로 실시간 전송
    - 다른 사용자 그림 즉시 반영
23. ✅ 추가 기능
    - 실시간 채팅
    - 사용자 입장/퇴장 알림

### Phase 6: 메모 기능 구현 ⏭️ (건너뜀)
복구 기능 없는 메모 기능은 불필요하다고 판단하여 구현하지 않음

### Phase 7: 이미지 저장 기능 ✅ (완료 - MongoDB 사용)
27. ✅ MongoDB 저장 방식 구현 (S3 대신)
    - CanvasHistory 엔티티: roomId, imageData(Base64), savedAt
    - AWS 설정 불필요, 즉시 사용 가능
28. ✅ Canvas 저장 API
    - POST /api/canvas/save
    - Canvas → Base64 PNG → MongoDB 저장
29. ✅ Canvas 불러오기 API
    - GET /api/canvas/{roomId}
    - 최근 저장된 캔버스 조회
30. ✅ 프론트엔드 저장/불러오기 버튼
    - 💾 저장 버튼 (헤더)
    - 📂 불러오기 버튼 (헤더)
    - Canvas.toDataURL() → Base64 변환

**구현 변경**: AWS S3 대신 MongoDB Base64 저장 사용
- 장점: 설정 간단, 비용 무료, 빠른 구현
- 단점: 대용량 이미지 시 용량 증가
- 향후 S3로 전환 가능 (Service만 수정)

### Phase 8: 프론트엔드 통합 🔄 (부분 완료)
31. ✅ 로그인/회원가입 페이지 (index.html)
    - 폼 Validation
    - API 호출 및 localStorage 저장
32. ✅ 방 목록 페이지 (rooms.html)
    - 방 생성 버튼 및 모달
    - 방 목록 렌더링 (5초 자동 새로고침)
    - 방 입장/삭제 기능
33. ✅ 캔버스 페이지 (canvas.html)
    - WebSocket 연결 (SockJS + STOMP)
    - 드로잉 도구 UI (툴바)
    - 실시간 동기화 로직
    - 채팅 기능
34. ⏭️ 메모 위젯 구현 (건너뜀)
35. ✅ 저장/불러오기 버튼
    - Canvas를 MongoDB에 저장
    - 저장된 이미지 불러오기

### Phase 9: 추가 기능 및 개선 ⏳ (미구현)
36. ⏳ 실행 취소(Undo)/다시 실행(Redo) 기능
37. ⏳ 전체 캔버스 지우기 기능
38. 🔄 참여자 목록 표시 (UI만 있음)
    - 현재 방에 접속한 사용자 목록
39. ⏳ 커서 위치 공유
    - 다른 사용자의 마우스 커서 위치 표시
40. 🔄 에러 처리 및 예외 핸들링
    - ✅ GlobalExceptionHandler 구현됨
    - ✅ WebSocket 재연결 로직 있음

    ### Phase 10: 테스트 및 배포 ⏳ (미구현)
    41. ⏳ 단위 테스트 작성
        - Service 레이어 테스트
    42. ⏳ 통합 테스트
        - API 엔드포인트 테스트
        - WebSocket 연결 테스트
    43. ⏳ 프론트엔드 빌드 최적화
    44. ⏳ Docker 컨테이너화 (선택)
        - Dockerfile 작성
        - docker-compose.yml 작성
    45. ⏳ AWS EC2 또는 클라우드 플랫폼에 배포
        - 환경 변수 설정
        - ✅ MongoDB Atlas 이미 사용 중
    46. ⏳ 성능 테스트
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

### canvas_history 컬렉션 (추가)
```
{
  _id: ObjectId,
  roomId: ObjectId,
  imageData: String (Base64),
  savedAt: Date
}
```

### memos 컬렉션 (미사용)
```
메모 기능은 구현하지 않음 (Phase 6 스킵)
```

## 5. 핵심 고려사항
- WebSocket 연결 안정성 (재연결 로직)
- 대용량 드로잉 데이터 처리 (throttling, debouncing)
- S3 업로드 비용 최적화
- MongoDB 인덱싱 전략 (roomId, userId)
- CORS 설정
- 보안 (XSS, CSRF 방지)

## 6. 개발 기간
**예상**: 20-30일 (약 4-6주)
**실제**: Phase 1-5, 7 완료 (약 60% 진행)

## 7. 구현된 주요 기능
- ✅ 사용자 회원가입/로그인
- ✅ 방 생성/삭제/입장/퇴장
- ✅ 실시간 협업 드로잉 (펜, 선, 도형, 지우개)
- ✅ 실시간 채팅
- ✅ 캔버스 저장/불러오기 (MongoDB)
- ✅ WebSocket 양방향 통신

## 8. 다음 개발 계획
- Undo/Redo 기능
- 전체 캔버스 지우기
- 참여자 목록 실시간 업데이트
- 캔버스 다운로드 (PNG)
- 성능 최적화 및 테스트
