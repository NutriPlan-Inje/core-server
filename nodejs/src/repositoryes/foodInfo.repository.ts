import { Inject, Service } from "typedi";
import Repository from "./index.repository";
import mysql from 'mysql2/promise'
import FoodInfoDTO from "../dto/response/foodInfo";

@Service()
export default class FoodInfoRepository extends Repository{
    constructor( @Inject('pool') pool : mysql.Pool){
        super(pool);
    }
    //[ ] CRUD
    async findFoodInfoById({ f_id } : { f_id : number }) : Promise<FoodInfoDTO> {
        let result : FoodInfoDTO[] = [];
        try{
            const query : string = 'SELECT * FROM foodInfo WHERE id = ?';
            result = await this.executeQuery(query, [f_id]);
            return result[0];
        }catch (error) {
            console.error(error);
            return result[0];
        }
    }

    async deleteFoodInfoById( { f_id } : { f_id : number }) {
        const query = 'DELETE FROM foodInfo WHERE id = ?';
        
        await this.executeQuery(query, [f_id]);
    }
}