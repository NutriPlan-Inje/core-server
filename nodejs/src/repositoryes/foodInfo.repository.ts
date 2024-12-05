import { Inject, Service } from "typedi";
import Repository from "./index.repository";
import mysql from 'mysql2/promise'
import FoodInfoDTO from "../dto/response/foodInfo";
import { Redis } from "ioredis";

@Service()
export default class FoodInfoRepository extends Repository{
    constructor( 
        @Inject('pool') pool : mysql.Pool,
        @Inject('redis') private readonly redis : Redis,
        ){
        super(pool);
    }
    async findFoodInfoById({ f_id }: { f_id: number }): Promise<FoodInfoDTO> {
        let result: FoodInfoDTO[] = [];
        try {
            const redisKey = `foodInfo:${f_id}`;
            const redisResult = await this.redis.get(redisKey);
    
            if (redisResult) {
                return JSON.parse(redisResult) as FoodInfoDTO;
            }
    
            const query: string = 'SELECT * FROM foodInfo WHERE id = ?';
            result = await this.executeQuery(query, [f_id]);
    
            if (result.length > 0) {
                await this.redis.set(redisKey, JSON.stringify(result[0]), "EX", 1000 * 5); // TTL 5초
            }

            return result[0];
        } catch (error) {
            console.error(error);
            throw error; 
        }
    }
    

    async deleteFoodInfoById( { f_id } : { f_id : number }) {
        const query = 'DELETE FROM foodInfo WHERE id = ?';
        
        await this.executeQuery(query, [f_id]);
    }
}