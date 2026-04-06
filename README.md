# Board

게시판 웹 애플리케이션 — Spring Boot + React

## 프로젝트 구조

```
board/
├── board/       # 백엔드 (Spring Boot, PostgreSQL)
├── frontend/    # 프론트엔드 (React, Vite)
```

각 디렉토리의 README를 참고하세요.

## 주요 기능

- 게시글 CRUD (생성, 조회, 수정, 삭제)
- 페이징, 제목 검색
- 비밀번호 기반 수정/삭제 인증

## 실행 방법

1. PostgreSQL 실행 (localhost:5432)
2. 백엔드: `cd board && ./gradlew bootRun`
3. 프론트엔드: `cd frontend && npm install && npm run dev`
4. 브라우저에서 `http://localhost:5173` 접속
