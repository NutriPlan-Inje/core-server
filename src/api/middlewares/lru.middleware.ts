import { NextFunction, Response, Request } from 'express';
import LRU from 'lru-cache'; 

const cache = new LRU<string, any>({
    max : 100, //최대 캐시 항목 수
    ttl : 1000 * 60 * 5 // TTL 5분
});

export const cacheMiddleware = (keyGenerator : (req : Request) => string) => {
    return ( req : Request, res : Response, next : NextFunction) => {
        const cacheKey = keyGenerator(req);

        if (cache.has(cacheKey)) {
            console.log("캐시에서 데이터 가져오기!");
            return res.status(200).json(cache.get(cacheKey));
        }

        const originalSend = res.json.bind(res);
        res.json = (body) => {
            cache.set(cacheKey, body);
            return originalSend(body);
        };

        next();
    };
};