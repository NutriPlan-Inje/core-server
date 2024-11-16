import Redis from "ioredis";

export default async function redisLoader() : Promise<Redis> {
    const redis = new Redis({
        //host : "redis",
        host : "127.0.0.1",
        port : 6379
    });

    return redis;
}