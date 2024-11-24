import { Inject, Service } from "typedi";
import FoodInfoDTO, { DeleteFoodInfoResponseDTO, FoodInfoResponseDTO } from "../dto/response/foodInfo";
import FoodInfoRepository from "../repositoryes/foodInfo.repository";


@Service()
export class FoodInfoService {
    constructor(
        @Inject( () => FoodInfoRepository) private readonly foodInfoRepository : FoodInfoRepository
    ){}

    async findFoodInfoById({ f_id } : { f_id : number }) : Promise<FoodInfoResponseDTO> {
        try{
            const foodInfo : FoodInfoDTO = await this.foodInfoRepository.findFoodInfoById({f_id});
            if (foodInfo === undefined){
                throw new Error();
            }
            const foodInfoResponseDTO : FoodInfoResponseDTO = {
                statusCode : 200,
                message : '성공적으로 조회했습니다',
                data : foodInfo
            }

            return foodInfoResponseDTO;
        }catch (error) {
            console.error(error);
            return {
                statusCode : 404,
                message : '조회에 실패했습니다',
                data : null
            } as FoodInfoResponseDTO;
        }   
    }
    

    async deleteFoodInfoById({ f_id } : { f_id : number }) : Promise<DeleteFoodInfoResponseDTO> {
        await this.foodInfoRepository.deleteFoodInfoById({f_id});
        
        return {
            message : '삭제가 완료되었습니다',
            statusCode : 200,
        }
    }
}