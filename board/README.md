# Board CRUD - 멋쟁이 사자처럼 백엔드 1팀

Spring Boot로 구현한 게시판 REST API 프로젝트입니다.

## 기술 스택

- Java 21
- Spring Boot 3.5.13
- Spring Data JPA
- PostgreSQL (Docker)
- Lombok

## 실행 방법

### 1. PostgreSQL 실행

```bash
docker start board-db
```

처음 실행하는 경우:

```bash
docker run --name board-db \
  -e POSTGRES_DB=board \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres
```

### 2. Spring Boot 실행

```bash
./gradlew bootRun
```

서버는 `http://localhost:8080` 에서 실행됩니다.

## 패키지 구조

```
src/main/java/com/example/board/
├── config/
│   └── WebConfig.java        # CORS 설정
├── controller/
│   └── PostController.java   # API 엔드포인트
├── dto/
│   ├── PostCreateRequest.java
│   ├── PostUpdateRequest.java
│   ├── PostDeleteRequest.java
│   ├── PostResponse.java
│   └── PostListResponse.java
├── entity/
│   └── Post.java             # DB 테이블 매핑
├── repository/
│   └── PostRepository.java   # DB 접근
└── service/
    └── PostService.java      # 비즈니스 로직
```

## API 명세

### 게시글 생성

```
POST /api/posts
```

Request Body:
```json
{
  "username": "작성자",
  "password": "비밀번호",
  "title": "제목",
  "content": "내용"
}
```

Response (201):
```json
{
  "id": 1,
  "title": "제목",
  "content": "내용",
  "userName": "작성자",
  "createdAt": "2026-04-06T00:00:00",
  "updatedAt": "2026-04-06T00:00:00"
}
```

### 게시글 목록 조회 (페이징 + 검색)

```
GET /api/posts?page=0&size=10&keyword=검색어
```

- `keyword` 는 선택사항. 없으면 전체 목록 반환.
- 최신순 정렬.
- 삭제된 글 제외.

Response (200):
```json
[
  {
    "id": 1,
    "title": "제목",
    "userName": "작성자",
    "createdAt": "2026-04-06T00:00:00"
  }
]
```

### 게시글 상세 조회

```
GET /api/posts/{id}
```

Response (200):
```json
{
  "id": 1,
  "title": "제목",
  "content": "내용",
  "userName": "작성자",
  "createdAt": "2026-04-06T00:00:00",
  "updatedAt": "2026-04-06T00:00:00"
}
```

### 게시글 수정

```
PUT /api/posts
```

Request Body:
```json
{
  "id": 1,
  "password": "비밀번호",
  "title": "수정된 제목",
  "content": "수정된 내용"
}
```

Response (200):
```json
{
  "id": 1,
  "title": "수정된 제목",
  "content": "수정된 내용",
  "userName": "작성자",
  "createdAt": "2026-04-06T00:00:00",
  "updatedAt": "2026-04-06T00:00:00"
}
```

### 게시글 삭제

```
DELETE /api/posts
```

Request Body:
```json
{
  "id": 1,
  "password": "비밀번호"
}
```

Response: 204 No Content

삭제된 글은 DB에서 완전히 제거되지 않고 `deletedAt` 값이 설정됩니다 (Soft Delete).

## 주요 구현 사항

- Soft Delete: 삭제 시 `deletedAt` 컬럼에 시간을 기록하고 목록 조회에서 제외
- 페이징: Spring Data JPA `Pageable` 사용
- 제목 검색: `findByTitleContainingAndDeletedAtIsNull` 메서드로 구현
- 작성/수정 시간 자동 기록: `@CreatedDate`, `@LastModifiedDate` 사용
- 수정/삭제 권한: 작성 시 입력한 password로 검증
