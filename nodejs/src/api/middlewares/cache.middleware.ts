import { NextFunction, Response, Request } from 'express';
import Redis from 'ioredis';

const redisClient = new Redis({
    host: "redis",
    port: 6379,   
});


export const cacheMiddleware = (keyGenerator: (req: Request) => string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const cacheKey = keyGenerator(req);

        try {
            const cachedData = await redisClient.get(cacheKey);
            if (cachedData) {
                console.log("✅ Redis에서 데이터 가져오기!");
                return res.status(200).json(JSON.parse(cachedData));
            }

            const originalSend = res.json.bind(res);
            res.json = (body) => {
                try {
                    redisClient.set(cacheKey, JSON.stringify(body), "EX", 1000 * 5); //5초 너무 오래하면 데이터 변경시 업뎃이 늦을 수도 있음
                    console.log("✅ Redis에 데이터 저장 완료!");
                } catch (err) {
                    console.error("❌ Redis에 데이터 저장 실패:", err);
                }
                return originalSend(body);
            };

            next();
        } catch (err) {
            console.error("❌ Redis 오류:", err);
            next();
        }
    };
};
