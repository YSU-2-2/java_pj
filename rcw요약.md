# RCW 프로젝트 요약

## 기본 정보
- **프로젝트명**: RCW (Real-time Collaborative Whiteboard)
- **팀명**: DrawGather
- **팀원**: 김기연(팀장), 김태현, 김찬영, 장윤서
- **발표일**: 2025-12-10

## 핵심 개념
여러 사람이 동시에 접속해서 한 화면에 실시간으로 그림을 그리는 협업 화이트보드

## 기술 스택
```
Frontend: Java Swing (데스크톱 앱)
Backend: Spring Boot + WebSocket (STOMP)
Database: AWS RDS (MySQL)
Storage: AWS S3 (이미지 저장)
```

## 주요 기능
1. **로그인/회원가입** - 아이디, 비밀번호, 닉네임만
2. **실시간 드로잉** - 펜, 5가지 색상, 지우개
3. **실시간 동기화** - WebSocket으로 여러 명이 동시에 그림
4. **이미지 저장** - 완성된 그림을 S3에 PNG로 저장

## 데이터베이스 구조
```sql
users           - 사용자 정보 (id, username, password, nickname)
rooms           - 방 정보 (room_code)
saved_drawings  - 저장된 그림 (id, room_code, user_id, s3_url)
```

## 구현 순서
### Week 1 (11/19~11/22)
- AWS RDS 연결 + 로그인/회원가입 API
- Java Swing UI + 로컬 드로잉 기능

### Week 2 (11/23~11/26)
- WebSocket 실시간 동기화
- S3 이미지 저장 기능

## 현재 상태 (11/19)
✅ Phase 0 완료
- Spring Boot 백엔드 프로젝트 생성
- Java Swing 클라이언트 프로젝트 생성

📋 다음 작업
- AWS RDS 인스턴스 생성
- Spring Boot - RDS 연결
- 로그인/회원가입 API 구현

## 프로젝트 폴더 구조
```
rcw/
├── backend/              # Spring Boot 백엔드
│   ├── entity/          # User, Room, SavedDrawing
│   ├── repository/
│   ├── service/
│   ├── controller/
│   └── config/          # WebSocket, S3 설정
│
└── desktop-client/      # Java Swing 클라이언트
    ├── LoginFrame.java
    ├── CanvasFrame.java
    └── WebSocketClient.java
```

## 성공 기준
✅ 2명 이상 동시 접속하여 실시간으로 그림 공유
✅ 로그인/회원가입 정상 작동
✅ 그림이 S3에 저장되고 URL이 DB에 기록
✅ AWS RDS + S3 모두 사용
