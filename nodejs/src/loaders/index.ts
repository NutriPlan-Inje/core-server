// src/loaders/index.ts
import expressLoader from './express.loader';  // Express 설정
import dependencyInjectionLoader from './dependency-injection.loader';  // 의존성 로더
import mysqlLoader from './mysql.loader';  // MySQL 연결 로더
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
    // 1️⃣ MySQL 및 redis 생성
    const pool = await mysqlLoader();
    const redis = await redisLoader();

    // 2️⃣ 의존성 주입 (TypeDI 컨테이너에 등록)
    await dependencyInjectionLoader({ pool, redis });

    // 3️⃣ Express 설정 적용
    await expressLoader({ app });

    console.log('All loaders initialized successfully!');
}