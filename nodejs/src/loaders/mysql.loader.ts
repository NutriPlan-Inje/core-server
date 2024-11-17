import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export default async () => {
    try{
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

        return pool;
    } catch (error) {
        console.error('MySQL 연결 오류 : ',error); 
        throw error; 
    }   
} 