// src/loaders/index.ts
import expressLoader from './express.loader';  // Express 설정
import dependencyInjectionLoader from './dependency-injection.loader';  // 의존성 로더
import mysqlLoader from './mysql.loader';  // MySQL 연결 로더
import openaiLoader from './openai.loader';  // OpenAI 설정 로더
import chatSocket from '../io/index';  // Socket.IO 설정
import http from 'http';
import { Application } from 'express';
import redisLoader from './redis.loader';

export default async function loaders({
    app,
    server,
}: {
    app: Application;
    server: http.Server;
}): Promise<void> {
    // 1️⃣ MySQL 및 OpenAI 인스턴스 로드
    const pool = await mysqlLoader();
    
    const openai = await openaiLoader();
    const redis = await redisLoader();

    // 2️⃣ 의존성 주입 (TypeDI 컨테이너에 등록)
    await dependencyInjectionLoader({ pool, openai, redis });

    // 3️⃣ Express 설정 적용
    await expressLoader({ app });

    // 4️⃣ Socket.IO 서버 초기화
    chatSocket(server);

    console.log('All loaders initialized successfully!');
}