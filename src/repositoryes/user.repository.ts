import { Inject, Service } from "typedi";
import mysql from 'mysql2/promise';
import Repository from "./index.repository";
import UserDTO from "../dto/response/user";

@Service()
export default class UserRepository extends Repository{
    constructor( @Inject('pool') pool : mysql.Pool){
        super(pool);
    }
    
    async getUserInfoByUid ( { u_id } : { u_id : number }) : Promise<UserDTO> {
        const query : string = 'SELECT id, height, weight, age, bmr FROM user WHERE id = ?'
        const result : UserDTO[] =  await this.executeQuery(query, [u_id]);
        return result[0];
    }
}

