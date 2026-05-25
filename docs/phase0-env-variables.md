# Phase 0 - 환경변수화

## 목적

배포 환경(EC2, Vercel)에서 동작하도록 모든 `localhost` 하드코딩을 환경변수로 분리한다.
로컬 개발 시에는 기본값이 적용되어 환경변수 없이도 그대로 동작한다.

---

## 변경 파일 목록

### 백엔드

#### 1. `application.properties`

| 항목 | 변경 전 | 변경 후 |
|------|---------|---------|
| DB URL | `jdbc:postgresql://localhost:5432/board` | `${DB_URL:jdbc:postgresql://localhost:5432/board}` |
| Redis host | `localhost` | `${REDIS_HOST:localhost}` |
| Redis port | `6379` | `${REDIS_PORT:6379}` |
| Naver redirect URI | `http://localhost:8080/login/oauth2/code/naver` | `${NAVER_REDIRECT_URI:http://localhost:8080/login/oauth2/code/naver}` |

신규 추가:
| 항목 | 값 |
|------|-----|
| `cors.allowed-origins` | `${CORS_ALLOWED_ORIGINS:http://localhost:5173}` |
| `oauth2.frontend-url` | `${OAUTH2_FRONTEND_URL:http://localhost:5173}` |

#### 2. `SecurityConfig.java`

CORS 허용 origin을 환경변수에서 읽도록 변경.

```java
// 변경 전
config.setAllowedOrigins(List.of("http://localhost:5173"));

// 변경 후
@Value("${cors.allowed-origins:http://localhost:5173}")
private String allowedOrigins;
// ...
config.setAllowedOrigins(List.of(allowedOrigins.split(",")));
```

- 쉼표 구분으로 여러 origin 허용 가능 (예: `http://localhost:5173,https://board.도메인`)

#### 3. `OAuth2SuccessHandler.java`

OAuth2 인증 성공 후 프론트엔드로 리다이렉트하는 URL을 환경변수에서 읽도록 변경.

```java
// 변경 전
String redirectUrl = "http://localhost:5173/oauth2/callback" + ...

// 변경 후
@Value("${oauth2.frontend-url:http://localhost:5173}")
private String frontendUrl;
// ...
String redirectUrl = frontendUrl + "/oauth2/callback" + ...
```

#### 4. `application.properties.example`

위 변경 사항을 반영하여 최신화.

### 프론트엔드

#### 5. `src/api/axios.js`

API 서버 URL을 Vite 환경변수에서 읽도록 변경.

```javascript
// 변경 전
baseURL: 'http://localhost:8080'
// reissue 요청에서도
'http://localhost:8080/api/members/reissue'

// 변경 후
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
baseURL: API_URL
`${API_URL}/api/members/reissue`
```

#### 6. `src/pages/Login.jsx`

OAuth2 소셜 로그인 URL을 환경변수에서 읽도록 변경.

```javascript
// 변경 전
const GOOGLE_URL = 'http://localhost:8080/oauth2/authorization/google'
const NAVER_URL = 'http://localhost:8080/oauth2/authorization/naver'

// 변경 후
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
const GOOGLE_URL = `${API_URL}/oauth2/authorization/google`
const NAVER_URL = `${API_URL}/oauth2/authorization/naver`
```

### 기타

#### 7. `.gitignore` (루트)

```diff
 .claude
 node_modules/
+.idea/
+.env
+.env.*
```

---

## 환경변수 전체 정리

### 배포 시 반드시 설정해야 하는 값

| 환경변수 | 예시 값 |
|----------|---------|
| `DB_URL` | `jdbc:postgresql://rds-endpoint:5432/board` |
| `DB_USERNAME` | `board_admin` |
| `DB_PASSWORD` | `(시크릿)` |
| `JWT_SECRET` | `(시크릿)` |
| `REDIS_HOST` | `redis` (Docker 컨테이너명) |
| `CORS_ALLOWED_ORIGINS` | `https://board.도메인` |
| `OAUTH2_FRONTEND_URL` | `https://board.도메인` |
| `NAVER_REDIRECT_URI` | `https://api.board.도메인/login/oauth2/code/naver` |
| `GOOGLE_CLIENT_ID` | `(시크릿)` |
| `GOOGLE_CLIENT_SECRET` | `(시크릿)` |
| `NAVER_CLIENT_ID` | `(시크릿)` |
| `NAVER_CLIENT_SECRET` | `(시크릿)` |
| `VITE_API_URL` | `https://api.board.도메인` |

### 로컬 개발 시 설정이 필요한 값

`DB_URL`, `REDIS_HOST`, `REDIS_PORT`, `CORS_ALLOWED_ORIGINS`, `OAUTH2_FRONTEND_URL`, `NAVER_REDIRECT_URI`는 기본값이 있으므로 설정 불필요.

아래 값만 로컬 `.env` 또는 환경변수로 설정하면 된다:
- `DB_USERNAME`, `DB_PASSWORD`
- `JWT_SECRET`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET`

---

## 검증

- 환경변수 없이 로컬에서 기존과 동일하게 동작하는지 확인
- `VITE_API_URL`을 설정하지 않아도 프론트가 `localhost:8080`으로 요청하는지 확인
