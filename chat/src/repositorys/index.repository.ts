import mysql from "mysql2/promise";
import {Inject} from "typedi";

export default class Repository {
    protected pool : mysql.Pool;

    constructor(@Inject('pool') pool : mysql.Pool){
        this.pool = pool;
    }

    protected async executeQuery (query : string, values : any[]) : Promise<any> {
        let connection : mysql.PoolConnection | null  = null;

        try{
            connection = await this.pool.getConnection();
            
            const [result, fields] = await connection.query(query, values);
            
            return result;
        } catch (error) {
            console.error(`Error executing query :  ${query}`, error);
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }
}