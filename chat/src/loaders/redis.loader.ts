import Redis from "ioredis";
import Container from "typedi";

export default async function redisLoader() : Promise<Redis> {
    const redis = new Redis({
        host : "redis",
        port : 6379
    });
    
    return redis;
}