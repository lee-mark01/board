# Phase 1 - Docker화

## 목적

Spring Boot + Redis + Nginx를 Docker Compose로 구성하여 어디서든 동일한 환경으로 실행할 수 있게 한다.

---

## 생성 파일 목록

### 1. `board/Dockerfile` - Spring Boot 이미지

Multi-stage build로 이미지 크기를 최소화한다.

```dockerfile
# Stage 1: Build - Gradle로 JAR 생성
FROM gradle:8-jdk21 AS build
WORKDIR /app
COPY build.gradle settings.gradle ./
COPY gradle ./gradle
RUN gradle dependencies --no-daemon || true   # 의존성 캐싱
COPY src ./src
RUN gradle bootJar --no-daemon -x test

# Stage 2: Run - JRE만 포함한 경량 이미지
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**왜 Multi-stage인가?**
- Build stage: Gradle + JDK + 소스 전체 (~800MB)
- Run stage: JRE + JAR만 (~300MB)
- 최종 이미지에 빌드 도구가 포함되지 않아 보안, 크기 모두 유리

**의존성 캐싱:**
- `build.gradle`과 `gradle/`을 먼저 복사 → `gradle dependencies` 실행
- 소스 코드가 바뀌어도 의존성 레이어는 캐시되어 빌드 시간 단축

### 2. `docker-compose.yml` - 서비스 오케스트레이션

```yaml
services:
  app:        # Spring Boot
  redis:      # Refresh Token 저장
  nginx:      # 리버스 프록시
```

| 서비스 | 이미지 | 포트 | 역할 |
|--------|--------|------|------|
| `app` | 직접 빌드 (board/Dockerfile) | 8080 (내부) | API 서버 |
| `redis` | redis:7-alpine | 6379 (내부) | RT 저장소 |
| `nginx` | nginx:alpine | 80 (외부) | 리버스 프록시 |

**포트 노출 구조:**
- `app`, `redis`는 `expose`로 내부 네트워크에서만 접근 가능
- `nginx`만 `ports: 80:80`으로 외부 노출
- 외부 → nginx(:80) → app(:8080) 순서로 요청 전달

### 3. `nginx/default.conf` - 리버스 프록시 설정

```nginx
server {
    listen 80;
    server_name localhost;

    location / {
        proxy_pass http://app:8080;    # Docker 내부 DNS로 컨테이너 접근
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

- `proxy_pass http://app:8080` — Docker Compose 내부 DNS가 `app`을 서비스 컨테이너 IP로 해석
- `X-Forwarded-*` 헤더 — Spring Boot가 원래 클라이언트 정보를 알 수 있도록 전달

### 4. `.env.example` - 환경변수 템플릿

로컬 테스트 시 `.env.example`을 복사하여 `.env`로 만들어 사용한다.

```bash
cp .env.example .env
# .env 파일에 실제 값 입력
```

**주의:** Docker Compose 환경에서는 `REDIS_HOST=redis`로 설정해야 한다 (컨테이너명).

### 5. `board/.dockerignore`

빌드 캐시, IDE 설정 등 불필요한 파일이 Docker 빌드 컨텍스트에 포함되지 않도록 제외.

---

## 컨테이너 간 네트워크

```
외부 :80 ──→ nginx ──→ app:8080 ──→ redis:6379
                                 ──→ RDS (외부 DB)
```

Docker Compose는 자동으로 브릿지 네트워크를 생성하며, 서비스명으로 서로 통신한다.

---

## 로컬 실행 방법

```bash
# 1. 환경변수 파일 생성
cp .env.example .env
# .env에 실제 값 입력

# 2. 실행
docker compose up --build

# 3. 확인
curl http://localhost/api/posts

# 4. 종료
docker compose down
```

---

## 배포 환경에서의 차이

| 항목 | 로컬 | 배포 (EC2) |
|------|------|-----------|
| DB | localhost PostgreSQL | RDS 엔드포인트 |
| REDIS_HOST | `redis` | `redis` (동일, 같은 compose) |
| Nginx | HTTP (:80) | HTTPS (:443) + Let's Encrypt |
| app 이미지 | 직접 빌드 | ECR에서 pull |
