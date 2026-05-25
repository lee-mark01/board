# 배포 계획서

## 프로젝트 개요

Spring Boot + React 게시판 애플리케이션을 현업 표준 아키텍처로 배포한다.

- **백엔드**: Spring Boot 3.5, Java 21, PostgreSQL, Redis, JWT + OAuth2
- **프론트엔드**: React 19, Vite 8, Tailwind CSS v4

---

## 배포 아키텍처

```
사용자
 ├── board.도메인        → Vercel (React 정적 파일)
 └── api.board.도메인    → EC2 (Spring Boot API)
                           │
                        Nginx (:80 → :443 리다이렉트, :443 → :8080 프록시)
                           │
                     ┌─────┼─────┐
                     │           │
                   RDS         Redis
                 PostgreSQL   (Docker 컨테이너)
```

## 기술 스택

| 구성 요소 | 기술 | 용도 |
|-----------|------|------|
| 프론트엔드 호스팅 | Vercel | React 빌드 결과 서빙, CDN, 자동 HTTPS |
| 백엔드 서버 | AWS EC2 (t2.micro) | Spring Boot 실행 |
| 데이터베이스 | AWS RDS PostgreSQL (db.t3.micro) | 영구 데이터 저장 |
| 캐시/세션 | Redis (EC2 내 Docker 컨테이너) | Refresh Token 저장 |
| 이미지 저장소 | AWS ECR | Spring Boot Docker 이미지 |
| CI/CD | GitHub Actions | 자동 빌드, 테스트, 배포 |
| 리버스 프록시 | Nginx | SSL termination, 프록시 |
| SSL 인증서 | Let's Encrypt (Certbot) | HTTPS |
| DNS | Route 53 또는 도메인 업체 | 도메인 관리 |
| 컨테이너 | Docker + Docker Compose | 애플리케이션 컨테이너화 |

---

## 환경변수 목록

### 백엔드 (application.properties)

| 환경변수 | 설명 | 로컬 기본값 |
|----------|------|-------------|
| `DB_URL` | PostgreSQL 접속 URL | `jdbc:postgresql://localhost:5432/board` |
| `DB_USERNAME` | DB 사용자명 | - |
| `DB_PASSWORD` | DB 비밀번호 | - |
| `JWT_SECRET` | JWT 서명 키 | - |
| `REDIS_HOST` | Redis 호스트 | `localhost` |
| `REDIS_PORT` | Redis 포트 | `6379` |
| `CORS_ALLOWED_ORIGINS` | 허용 Origin (쉼표 구분) | `http://localhost:5173` |
| `OAUTH2_FRONTEND_URL` | OAuth2 인증 후 리다이렉트할 프론트 URL | `http://localhost:5173` |
| `NAVER_REDIRECT_URI` | Naver OAuth2 콜백 URI | `http://localhost:8080/login/oauth2/code/naver` |
| `GOOGLE_CLIENT_ID` | Google OAuth2 클라이언트 ID | - |
| `GOOGLE_CLIENT_SECRET` | Google OAuth2 클라이언트 시크릿 | - |
| `NAVER_CLIENT_ID` | Naver OAuth2 클라이언트 ID | - |
| `NAVER_CLIENT_SECRET` | Naver OAuth2 클라이언트 시크릿 | - |

### 프론트엔드 (Vercel 환경변수)

| 환경변수 | 설명 | 로컬 기본값 |
|----------|------|-------------|
| `VITE_API_URL` | 백엔드 API 서버 URL | `http://localhost:8080` |

---

## 작업 단계

### Phase 0 - 환경변수화 (완료)

localhost 하드코딩 제거, 모든 환경 의존 값을 환경변수로 분리.

- [x] `application.properties` - DB URL, Redis, CORS, OAuth2 환경변수화
- [x] `SecurityConfig.java` - CORS origin 환경변수화
- [x] `OAuth2SuccessHandler.java` - 프론트 redirect URL 환경변수화
- [x] `axios.js` - API baseURL → `VITE_API_URL`
- [x] `Login.jsx` - OAuth URL → `VITE_API_URL`
- [x] `.gitignore` - `.env`, `.idea/` 추가
- [x] `application.properties.example` 최신화

### Phase 1 - Docker화

Spring Boot와 Redis를 컨테이너로 구성.

- [ ] `board/Dockerfile` - Multi-stage build (Gradle build → JRE 21 실행)
- [ ] `docker-compose.yml` - spring-boot + redis + nginx 구성
- [ ] `nginx/default.conf` - 리버스 프록시 설정 (/ → :8080)
- [ ] 로컬에서 `docker compose up` 동작 확인

### Phase 2 - AWS 인프라 구축

- [ ] EC2 인스턴스 생성 (Amazon Linux 2023, t2.micro)
  - Docker, Docker Compose 설치
- [ ] RDS PostgreSQL 생성 (db.t3.micro, 프리티어)
  - EC2에서만 접근 가능하도록 Security Group 설정
- [ ] ECR 리포지토리 생성
- [ ] Security Group 설정
  - EC2: 22(SSH), 80(HTTP), 443(HTTPS)
  - RDS: 5432 (EC2 SG에서만 허용)
- [ ] IAM 사용자 생성 (GitHub Actions용, ECR 접근 권한)

### Phase 3 - 도메인 + HTTPS

- [ ] 도메인 구매 (.shop, .site 등 저가 도메인)
- [ ] DNS 설정
  - `board.도메인` → Vercel (CNAME)
  - `api.board.도메인` → EC2 Elastic IP (A 레코드)
- [ ] EC2에 Certbot 설치, Let's Encrypt SSL 인증서 발급
- [ ] Nginx SSL 설정 (80 → 443 리다이렉트, 443에서 SSL termination)

### Phase 4 - CI/CD (GitHub Actions)

- [ ] `.github/workflows/deploy.yml` 작성
  ```
  main push
    → Gradle build + test
    → Docker build
    → ECR push
    → EC2 SSH 접속
    → docker compose pull && docker compose up -d
  ```
- [ ] GitHub Secrets 등록
  - `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
  - `AWS_REGION`, `ECR_REPOSITORY`
  - `EC2_HOST`, `EC2_SSH_KEY`
  - 백엔드 환경변수 (DB, JWT, OAuth 등)

### Phase 5 - 프론트엔드 배포 (Vercel)

- [ ] Vercel에 GitHub 리포지토리 연동
- [ ] Framework Preset: Vite
- [ ] Root Directory: `frontend`
- [ ] 환경변수 설정: `VITE_API_URL=https://api.board.도메인`
- [ ] main push 시 자동 빌드 + 배포 확인

### Phase 6 - 외부 서비스 설정 변경

- [ ] Google Cloud Console
  - 승인된 리디렉션 URI에 `https://api.board.도메인/login/oauth2/code/google` 추가
- [ ] Naver Developers
  - 콜백 URL에 `https://api.board.도메인/login/oauth2/code/naver` 추가
- [ ] EC2 환경변수 설정
  - `CORS_ALLOWED_ORIGINS=https://board.도메인`
  - `OAUTH2_FRONTEND_URL=https://board.도메인`
  - `NAVER_REDIRECT_URI=https://api.board.도메인/login/oauth2/code/naver`

---

## 배포 후 검증 체크리스트

- [ ] `https://board.도메인` 접속 → React 페이지 로딩
- [ ] `https://api.board.도메인/api/posts` 접속 → JSON 응답
- [ ] 회원가입 → 로그인 → 게시글 CRUD 동작
- [ ] Google 소셜 로그인 동작
- [ ] Naver 소셜 로그인 동작
- [ ] 토큰 만료 후 자동 재발급 동작
- [ ] GitHub에 push → 자동 배포 완료 확인

---

## 비용 예상 (프리티어 기준)

| 항목 | 예상 비용 |
|------|-----------|
| EC2 t2.micro | 무료 (프리티어 12개월) |
| RDS db.t3.micro | 무료 (프리티어 12개월) |
| ECR | 500MB까지 무료 |
| Vercel | 무료 (Hobby 플랜) |
| 도메인 | 첫해 1,000~2,000원 |
| Let's Encrypt | 무료 |
| **합계** | **약 1,000~2,000원 (도메인만)** |
