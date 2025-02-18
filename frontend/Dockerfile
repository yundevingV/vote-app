# Multi-stage build

# 1단계: 환경 설정 및 dependency 설치
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat

# 명령어를 실행할 디렉터리 지정
WORKDIR /usr/src/app

# Dependency install을 위해 package.json, package-lock.json 복사 
COPY package.json package-lock.json ./ 

# Dependency 설치 (새로운 lock 파일 수정 또는 생성 방지)
RUN npm ci 

# ls 명령어로 현재 디렉터리 내용 출력
RUN ls -al

###########################################################

# 2단계: next.js 빌드 단계
FROM node:18-alpine AS builder

# Docker를 build할 때 개발 모드 구분용 환경 변수를 명시함
ARG NEXT_PUBLIC_CONTRACT_ADDRESS

# 명령어를 실행할 디렉터리 지정
WORKDIR /usr/src/app

# node_modules 등의 dependency를 복사함.
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .

# ls 명령어로 현재 디렉터리 내용 출력
RUN ls -al

# ls 명령어로 .env 파일이 잘 복사되었는지 확인
RUN ls -al ./.env.local

RUN npm run build

###########################################################

# 3단계: next.js 실행 단계
FROM node:18-alpine AS runner

# 명령어를 실행할 디렉터리 지정
WORKDIR /usr/src/app

# container 환경에 시스템 사용자를 추가함
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# next.config.js에서 output을 standalone으로 설정하면 
# 빌드에 필요한 최소한의 파일만 ./next/standalone로 출력이 된다.
# standalone 결과물에는 public 폴더와 static 폴더 내용은 포함되지 않으므로, 따로 복사를 해준다.
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/.next/static ./.next/static

# ls 명령어로 최종 디렉터리 내용 출력
RUN ls -al

# 컨테이너의 수신 대기 포트를 3000으로 설정
EXPOSE 3000

# node로 애플리케이션 실행
CMD ["sh", "-c", "echo '컨테이너가 실행되었습니다.' && node server.js"]
