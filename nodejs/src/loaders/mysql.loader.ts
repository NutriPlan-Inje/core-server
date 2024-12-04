import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import Redis from 'ioredis';

dotenv.config();

export default async () => {
    try {
        const pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT as unknown as number,
            database: process.env.DB_DATABASE,
            connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
            waitForConnections: true,
            queueLimit: 0,
        });

        // 디비 연결 여부를 테스트로 확인
        const connection = await pool.getConnection();
        console.log('MySQL 연결 성공!');
        connection.release();

        // FoodInfo 캐시에 올리기
        const redis = new Redis({
            host: "redis",
            port: 6379,
        });

        const [allFoodInfo, field] = await connection.query(`SELECT * FROM foodInfo`);
        const foodInfoArray = allFoodInfo as Array<any>;

        for (const foodInfo of foodInfoArray) {
            const redisKey = `foodInfo:${foodInfo.id}`;
            
            const redisValue = {
                statusCode: 200,
                message: "조회에 성공했습니다",
                data: foodInfo,
            };

            await redis.set(redisKey, JSON.stringify(redisValue), "EX", 3600); // TTL 1시간
            console.log(`✅ Redis에 저장됨: ${redisKey}`);
        }

        return pool;
    } catch (error) {
        console.error('MySQL 연결 오류 : ', error);
        throw error;
    }
};
