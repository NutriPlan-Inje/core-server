import { Inject, Service } from "typedi";
import Repository from "./index.repository";
import mysql from 'mysql2/promise'
import DietplanDTO from "../dto/response/dietPlan";

@Service()
export default class DietPlanRepository extends Repository{
    constructor( @Inject('pool') pool : mysql.Pool){
        super(pool);
    }
    //[ ] 조회 삭제
    async findDietPlanByDateAndUid( { date, u_id} : { date : string, u_id : number }) : Promise<DietplanDTO[]> {
        let result : DietplanDTO[] = [];
        try{
            const query : string = "SELECT * FROM userDietPlan WHERE DATE(date) = ? AND user_id = ? ORDER BY mealTime ASC";
            result = await this.executeQuery(query, [date, u_id]);
        
            return result;
        }catch (error) {
            console.error(error);
            return result
        }
    }

    async deleteDietPlanById( { id } : { id : number }) {
        const query : string = 'DELETE FROM userDietPlan WHERE id = ?'
        await this.executeQuery(query, [id]);
    }   
}