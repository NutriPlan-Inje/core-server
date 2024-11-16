import { Request, Response ,NextFunction } from "express";
import { Inject, Service } from "typedi";
import { FoodInfoResponseDTO, DeleteFoodInfoResponseDTO } from "../../dto/response/foodInfo";
import { FoodInfoService } from "../../services/foodInfo.service";

@Service()
export class FoodInfoController {
    constructor(
        @Inject( () => FoodInfoService ) private readonly foodInfoService : FoodInfoService
    ){}
    
    findFoodInfoById = async (req : Request, res : Response, next : NextFunction) => {
        try {
            const f_id : number = parseInt(req.params.f_id);
            const foodInfoResponseDTO : FoodInfoResponseDTO = await this.foodInfoService.findFoodInfoById({f_id});
            return res.status(200).json(foodInfoResponseDTO);
        } catch (error) {
            return next(error);
        }
    }
    
    deleteFoodInfoById = async (req : Request, res : Response, next : NextFunction) => {
        try {
            const f_id : number = parseInt(req.params.f_id);
            const deleteFoodInfoResponseDTO : DeleteFoodInfoResponseDTO = await this.foodInfoService.deleteFoodInfoById({ f_id });
            return res.status(200).json(deleteFoodInfoResponseDTO);
        } catch (error) {
            return next(error);
        }
    }

}