# Spring Boot + React 게시판 배포기

## 프로젝트 소개

Spring Boot + React로 만든 게시판 애플리케이션을 현업 표준 방식으로 AWS에 배포한 과정을 정리한다.

### 기술 스택
- **백엔드**: Spring Boot 3.5, Java 21, Spring Security, JWT, OAuth2 (Google, Naver)
- **프론트엔드**: React 19, Vite 8, Tailwind CSS v4
- **DB**: PostgreSQL (AWS RDS)
- **캐시**: Redis (Refresh Token 저장)
- **배포**: Docker, Docker Compose, Nginx, GitHub Actions, AWS ECR

---

## 배포 아키텍처

```
사용자
 ├── xxx.vercel.app       → Vercel (React)
 └── 54.116.10.233        → EC2 (Spring Boot API)
                              │
                           Nginx (:80)
                           └── / → Spring Boot (:8080)
                              │         │
                              │    ┌────┴────┐
                              │    │   RDS   │ PostgreSQL
                              │    └─────────┘
                              │
                           Redis (Docker 컨테이너)
```

프론트엔드와 백엔드를 분리 배포하는 현업 표준 구조를 채택했다.
- 프론트엔드: Vercel에서 정적 파일 서빙 + CDN + 자동 HTTPS
- 백엔드: EC2에서 Docker Compose로 Spring Boot + Redis + Nginx 실행
- DB: RDS로 분리하여 EC2와 독립적으로 관리

---

## Phase 0 - 환경변수화

### 왜 필요한가?

로컬 개발 환경에서는 `localhost`로 모든 게 동작하지만, 배포 환경에서는 RDS 엔드포인트, Vercel 도메인 등 값이 달라진다. 하드코딩을 환경변수로 분리해야 하나의 코드베이스로 여러 환경에서 동작할 수 있다.

### 변경 내용

#### 백엔드 - application.properties

```properties
# 변경 전
spring.datasource.url=jdbc:postgresql://localhost:5432/board
spring.data.redis.host=localhost

# 변경 후 (기본값 포함 → 로컬에서는 환경변수 없이도 동작)
spring.datasource.url=${DB_URL:jdbc:postgresql://localhost:5432/board}
spring.data.redis.host=${REDIS_HOST:localhost}
```

#### 백엔드 - SecurityConfig.java (CORS)

```java
// 변경 전: localhost만 허용
config.setAllowedOrigins(List.of("http://localhost:5173"));

// 변경 후: 환경변수에서 읽기, 쉼표로 여러 origin 허용 가능
@Value("${cors.allowed-origins:http://localhost:5173}")
private String allowedOrigins;

config.setAllowedOrigins(List.of(allowedOrigins.split(",")));
```

#### 백엔드 - OAuth2SuccessHandler.java

```java
// 변경 전
String redirectUrl = "http://localhost:5173/oauth2/callback" + ...

// 변경 후
@Value("${oauth2.frontend-url:http://localhost:5173}")
private String frontendUrl;

String redirectUrl = frontendUrl + "/oauth2/callback" + ...
```

#### 프론트엔드 - axios.js

```javascript
// 변경 전
baseURL: 'http://localhost:8080'

// 변경 후 (Vite 환경변수)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
baseURL: API_URL
```

#### 프론트엔드 - Login.jsx

```javascript
// 변경 전
const GOOGLE_URL = 'http://localhost:8080/oauth2/authorization/google'

// 변경 후
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
const GOOGLE_URL = `${API_URL}/oauth2/authorization/google`
```

### 환경변수 전체 목록

| 환경변수 | 용도 | 로컬 기본값 |
|----------|------|-------------|
| `DB_URL` | PostgreSQL 접속 URL | `jdbc:postgresql://localhost:5432/board` |
| `DB_USERNAME` | DB 사용자명 | - |
| `DB_PASSWORD` | DB 비밀번호 | - |
| `JWT_SECRET` | JWT 서명 키 | - |
| `REDIS_HOST` | Redis 호스트 | `localhost` |
| `REDIS_PORT` | Redis 포트 | `6379` |
| `CORS_ALLOWED_ORIGINS` | CORS 허용 Origin | `http://localhost:5173` |
| `OAUTH2_FRONTEND_URL` | OAuth2 인증 후 리다이렉트 URL | `http://localhost:5173` |
| `NAVER_REDIRECT_URI` | Naver OAuth2 콜백 URI | `http://localhost:8080/login/oauth2/code/naver` |
| `VITE_API_URL` | (프론트) 백엔드 API URL | `http://localhost:8080` |

**핵심 설계**: 모든 환경변수에 `${변수명:기본값}` 형태로 기본값을 넣어서 로컬 개발 시 환경변수 설정 없이도 동작하게 했다.

---

## Phase 1 - Docker화

### 왜 Docker를 쓰는가?

"내 컴퓨터에서는 되는데..."를 없앤다. Java 버전, Redis 설치, Nginx 설정 등을 전부 컨테이너로 묶어서 어떤 서버에서든 `docker compose up` 한 줄로 동일한 환경을 실행할 수 있다.

### Dockerfile (Multi-stage Build)

```dockerfile
# Stage 1: Build - Gradle로 JAR 파일 생성
FROM gradle:8-jdk21 AS build
WORKDIR /app
COPY build.gradle settings.gradle ./
COPY gradle ./gradle
RUN gradle dependencies --no-daemon || true   # 의존성 레이어 캐싱
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
- Build stage에는 Gradle + JDK + 소스 코드 전체가 포함 (~800MB)
- Run stage에는 JRE + JAR만 포함 (~300MB)
- 최종 이미지에 빌드 도구가 없으므로 보안과 크기 모두 유리

**의존성 캐싱 전략:**
- `build.gradle`을 먼저 복사 → `gradle dependencies` 실행
- 소스 코드가 바뀌어도 의존성 레이어는 Docker 캐시에서 재사용
- 빌드 시간 대폭 단축

### docker-compose.yml (로컬 개발용)

```yaml
services:
  app:
    build: ./board              # Dockerfile로 직접 빌드
    container_name: board-app
    env_file:
      - .env
    depends_on:
      - redis
    expose:
      - "8080"                  # 내부 네트워크에서만 접근
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: board-redis
    expose:
      - "6379"
    volumes:
      - redis-data:/data        # 컨테이너 재시작해도 데이터 유지
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    container_name: board-nginx
    ports:
      - "80:80"                 # 유일하게 외부 노출되는 포트
    volumes:
      - ./nginx/default.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - app
    restart: unless-stopped

volumes:
  redis-data:
```

### docker-compose.prod.yml (배포용)

로컬에서는 `build: ./board`로 직접 빌드하지만, 배포 환경에서는 ECR에서 이미지를 pull한다:

```yaml
services:
  app:
    image: 516232034601.dkr.ecr.ap-northeast-2.amazonaws.com/board-app:latest
    # 나머지 동일
```

### Nginx 리버스 프록시

```nginx
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://app:8080;     # Docker 내부 DNS로 컨테이너 접근
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

- `http://app:8080` — Docker Compose 네트워크에서 서비스명으로 통신
- `X-Forwarded-*` 헤더 — 원래 클라이언트 정보를 Spring Boot에 전달

### 컨테이너 네트워크 구조

```
외부 :80 → nginx → app:8080 → redis:6379
                            → RDS (외부 DB)
```

- `app`과 `redis`는 `expose`로 내부 전용
- `nginx`만 `ports: 80:80`으로 외부 노출
- 외부에서 Spring Boot나 Redis에 직접 접근 불가

---

## Phase 2 - AWS 인프라 구축

### 리소스 구성

| 리소스 | 스펙 | 용도 |
|--------|------|------|
| EC2 | t3.micro, Amazon Linux 2023 | 애플리케이션 서버 |
| RDS | db.t3.micro, PostgreSQL 18.3 | 데이터베이스 |
| ECR | 프라이빗 리포지토리 | Docker 이미지 저장소 |
| Elastic IP | 54.116.10.233 | EC2 고정 IP |

### Security Group 설계

보안의 핵심은 **최소 권한 원칙**. 필요한 포트만 필요한 대상에게만 열었다.

**board-ec2-sg (EC2용)**

| 포트 | 소스 | 용도 |
|------|------|------|
| 22 | 내 IP만 | SSH 접속 |
| 80 | 0.0.0.0/0 | HTTP |
| 443 | 0.0.0.0/0 | HTTPS |

**board-rds-sg (RDS용)**

| 포트 | 소스 | 용도 |
|------|------|------|
| 5432 | board-ec2-sg | EC2에서만 DB 접근 |

> RDS 보안 그룹의 소스에 EC2 보안 그룹 ID를 지정하면, 해당 보안 그룹이 적용된 EC2에서만 RDS에 접근할 수 있다. IP 기반보다 유연하고 안전하다.

### RDS 설정 포인트

- **퍼블릭 액세스: 아니오** — 외부에서 DB 직접 접근 차단
- **초기 데이터베이스: board** — 별도로 CREATE DATABASE 불필요
- **단일 AZ** — 개인 프로젝트에서 다중 AZ는 비용만 2배

### EC2 초기 설정

```bash
# Docker + Docker Compose 설치
sudo yum update -y
sudo yum install -y docker
sudo systemctl start docker && sudo systemctl enable docker
sudo usermod -aG docker ec2-user

sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### ECR

- Docker 이미지를 저장하는 프라이빗 레지스트리
- GitHub Actions에서 빌드한 이미지를 push → EC2에서 pull하는 구조

### IAM

- `github-actions-deployer` 사용자 생성
- `AmazonEC2ContainerRegistryPowerUser` 정책만 부여 (최소 권한)
- Access Key를 GitHub Secrets에 등록하여 CI/CD에서 사용

---

## Phase 4 - CI/CD (GitHub Actions)

### 자동 배포 파이프라인

main 브랜치에 push하면 자동으로 빌드 → ECR push → EC2 배포가 실행된다.

```
개발자가 git push
    │
    ▼
GitHub Actions 실행
    │
    ├── 1. 코드 체크아웃
    ├── 2. AWS 자격 증명 설정
    ├── 3. ECR 로그인
    ├── 4. Docker 이미지 빌드 + ECR push
    └── 5. EC2에 SSH 접속 → docker-compose pull + up
                │
                ▼
         EC2에서 새 이미지로 컨테이너 재시작
```

### deploy.yml

```yaml
name: Deploy to EC2

on:
  push:
    branches: [ main ]
    paths:
      - 'board/**'
      - 'docker-compose.yml'
      - 'nginx/**'

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-northeast-2

      - name: Login to ECR
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build and push Docker image
        run: |
          docker build -t board-app ./board
          docker tag board-app:latest ${{ secrets.ECR_URI }}:latest
          docker push ${{ secrets.ECR_URI }}:latest

      - name: Deploy to EC2
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ec2-user
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            aws ecr get-login-password --region ap-northeast-2 | \
              docker login --username AWS --password-stdin ${{ secrets.ECR_URI }}
            cd ~/app
            ECR_URI=${{ secrets.ECR_URI }} docker-compose -f docker-compose.prod.yml pull app
            ECR_URI=${{ secrets.ECR_URI }} docker-compose -f docker-compose.prod.yml up -d
```

### 핵심 설계 포인트

**paths 필터**: `board/`, `docker-compose.yml`, `nginx/` 파일이 변경될 때만 배포 실행. 프론트엔드만 수정하면 불필요한 백엔드 배포가 일어나지 않는다.

**GitHub Secrets**: 민감 정보는 코드에 넣지 않고 GitHub Secrets로 관리한다.

| Secret | 용도 |
|--------|------|
| `AWS_ACCESS_KEY_ID` | AWS 인증 |
| `AWS_SECRET_ACCESS_KEY` | AWS 인증 |
| `ECR_URI` | Docker 이미지 push/pull 대상 |
| `EC2_HOST` | SSH 접속 대상 |
| `EC2_SSH_KEY` | SSH 인증 (pem 파일 내용) |

### EC2 디렉토리 구조

```
~/app/
├── docker-compose.prod.yml    # ECR 이미지 기반 compose
├── .env                       # 환경변수 (DB, JWT, OAuth 등)
└── nginx/
    └── default.conf           # 리버스 프록시 설정
```

---

## 아직 남은 작업

- **Phase 5**: Vercel에 프론트엔드 배포 + `VITE_API_URL` 환경변수 설정
- **Phase 6**: CORS, OAuth2 redirect URI를 실제 배포 URL로 변경
- 도메인 구매 시: HTTPS (Let's Encrypt) 적용

---

## 배포 시 겪은 이슈

### 1. GitHub Push 시 workflow 권한 오류

```
! [remote rejected] main -> main (refusing to allow a Personal Access Token
to create or update workflow without `workflow` scope)
```

**원인**: Personal Access Token에 `workflow` 권한이 없으면 `.github/workflows/` 파일을 push할 수 없다.

**해결**: 토큰 설정에서 `workflow` 스코프 추가.

### 2. .env 파일이 ls에 안 보이는 문제

`.env`는 숨김 파일이므로 `ls`가 아니라 `ls -a`로 확인해야 한다.
