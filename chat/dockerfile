# Dockerfile
FROM node:18

# 애플리케이션 디렉터리 설정
WORKDIR /usr/src/app

# package.json과 package-lock.json 복사
COPY package*.json ./
COPY .env ./
# 의존성 설치
RUN npm install

# 앱 소스 복사
COPY . .


# 빌드 (필요한 경우)
RUN npm run build

# 애플리케이션 포트 설정
EXPOSE 3000

# 앱 실행 명령
CMD ["npm", "run", "start"]
