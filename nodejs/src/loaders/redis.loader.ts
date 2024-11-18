import Redis from "ioredis";

export default async function redisLoader() : Promise<Redis> {
    const redis = new Redis({
        host : process.env.REDIS_HOST || '127.0.0.1',
        port : Number(process.env.REDIS_PORT) || 6379
    });

    redis.on('connect', () => {
        console.log(`Redis connected to ${redis.options.host}:${redis.options.port}`);
    });

    redis.on('error', (err) => {
        console.error('Redis connection error:', err);
    });

    return redis;
}

redisLoader();