# Phase 2 - AWS 인프라 구축

## 목적

EC2, RDS, ECR을 생성하고 Security Group으로 네트워크를 구성한다.

---

## 생성된 리소스

### Security Group

**board-ec2-sg (EC2용)**

| 유형 | 포트 | 소스 |
|------|------|------|
| SSH | 22 | 내 IP |
| HTTP | 80 | 0.0.0.0/0 |
| HTTPS | 443 | 0.0.0.0/0 |

**board-rds-sg (RDS용)**

| 유형 | 포트 | 소스 |
|------|------|------|
| PostgreSQL | 5432 | board-ec2-sg |

> RDS 소스에 EC2 보안 그룹을 지정하여 EC2에서만 DB에 접근 가능하도록 설정.

### RDS

| 항목 | 값 |
|------|-----|
| 엔진 | PostgreSQL 18.3 |
| 인스턴스 | db.t3.micro |
| 스토리지 | 20GB gp3 |
| DB 인스턴스 식별자 | `board-db` |
| 마스터 사용자 | `board_admin` |
| 초기 데이터베이스 | `board` |
| 퍼블릭 액세스 | 아니오 |
| 보안 그룹 | board-rds-sg |
| 엔드포인트 | `board-db.cvsqwimyifjw.ap-northeast-2.rds.amazonaws.com` |

### EC2

| 항목 | 값 |
|------|-----|
| AMI | Amazon Linux 2023 |
| 인스턴스 유형 | t3.micro |
| 키 페어 | board-key.pem |
| 보안 그룹 | board-ec2-sg |
| Elastic IP | 54.116.10.233 |

### EC2 초기 설정

SSH 접속 후 실행한 명령어:

```bash
# 시스템 업데이트 + Docker 설치
sudo yum update -y && sudo yum install -y docker && sudo systemctl start docker && sudo systemctl enable docker && sudo usermod -aG docker ec2-user

# Docker Compose 설치
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose && sudo chmod +x /usr/local/bin/docker-compose
```

설치 확인:
```
Docker version 25.0.14
Docker Compose version v5.1.4
```

### ECR

| 항목 | 값 |
|------|-----|
| 리포지토리 이름 | `board-app` |
| 가시성 | 프라이빗 |
| URI | `516232034601.dkr.ecr.ap-northeast-2.amazonaws.com/board-app` |

### IAM

| 항목 | 값 |
|------|-----|
| 사용자 이름 | `github-actions-deployer` |
| 정책 | AmazonEC2ContainerRegistryPowerUser |
| 용도 | GitHub Actions에서 ECR push |

---

## 인프라 정보 요약

```
EC2 Elastic IP:        54.116.10.233
RDS 엔드포인트:         board-db.cvsqwimyifjw.ap-northeast-2.rds.amazonaws.com
RDS 사용자명:           board_admin
ECR URI:               516232034601.dkr.ecr.ap-northeast-2.amazonaws.com/board-app
IAM 사용자:            github-actions-deployer
리전:                   ap-northeast-2
```
