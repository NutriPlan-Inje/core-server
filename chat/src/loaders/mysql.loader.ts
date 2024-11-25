import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import Container from 'typedi';
import { Redis } from 'ioredis';

dotenv.config();

/*
    foodInfo table에 
    foodName으로 인덱스 되어 있음
*/
//TODO userDietPlan 멀티칼럼 Index 생성
//TODO redis Container에서 받아오는 걸로 수정
export default async () => {
    try{
        console.log(process.env); 
        const pool = mysql.createPool({
            host : process.env.DB_HOST,
            user : process.env.DB_USER,
            password : process.env.DB_PASSWORD,
            port : process.env.DB_PORT as unknown as number,
            database : process.env.DB_DATABASE,
            connectionLimit : parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
            waitForConnections : true,
            queueLimit : 0
        });

        //디비 연결 여부를 테스트로 
        const connection = await pool.getConnection(); 
        console.log('MySQL 연결 성공!');
        connection.release();

        //FoodInfo 캐시에 올리기
        const redis = new Redis({
            host : "redis",
            port : 6379
        });
        const [allFoodInfo, field] = await connection.query(`SELECT * FROM foodInfo`);
        redis.set('foodInfo', JSON.stringify(allFoodInfo))
        .then( () => console.log('✅ foodInfo Redis 저장 완료'))
        .catch( () => console.error('❌ foodInfo Redis 저장 실패'))


        return pool;
    } catch (error) {
        console.error('MySQL 연결 오류 : ',error); 
        throw error; 
    }   
} 