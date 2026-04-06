# Board Frontend

게시판 프론트엔드 — React + Vite

## 기술 스택

- React 19
- React Router v7
- Vite

## 실행 방법

```bash
npm install
npm run dev
```

`http://localhost:5173`에서 접속

## 사전 조건

- 백엔드 서버가 `http://localhost:8080`에서 실행 중이어야 합니다.
- 백엔드에 CORS 설정이 필요합니다. (`localhost:5173` 허용)

## 주요 기능

- 게시글 목록 조회 (최신순, 페이징)
- 제목 검색
- 게시글 작성 (작성자, 비밀번호, 제목, 내용)
- 게시글 상세 조회
- 게시글 수정/삭제 (비밀번호 인증)

## 프로젝트 구조

```
src/
├── api/
│   └── posts.js          # 백엔드 API 호출 함수
├── pages/
│   ├── PostList.jsx       # 목록 페이지
│   ├── PostDetail.jsx     # 상세 페이지
│   ├── PostWrite.jsx      # 작성 페이지
│   └── PostEdit.jsx       # 수정 페이지
├── App.jsx                # 라우팅 설정
├── App.css                # 헤더 스타일
├── index.css              # 글로벌 스타일 (다크모드)
└── main.jsx               # 엔트리포인트
```
