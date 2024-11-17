import Redis from "ioredis";

export default async function redisLoader() : Promise<Redis> {
    const redis = new Redis({
        host : "redis",
        port : 6379
    });

    return redis;
}