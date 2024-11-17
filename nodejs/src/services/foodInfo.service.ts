import { Inject, Service } from "typedi";
import FoodInfoDTO, { DeleteFoodInfoResponseDTO, FoodInfoResponseDTO } from "../dto/response/foodInfo";
import FoodInfoRepository from "../repositoryes/foodInfo.repository";


@Service()
export class FoodInfoService {
    constructor(
        @Inject( () => FoodInfoRepository) private readonly foodInfoRepository : FoodInfoRepository
    ){}

    async findFoodInfoById({ f_id } : { f_id : number }) : Promise<FoodInfoResponseDTO> {
        const foodInfo : FoodInfoDTO = await this.foodInfoRepository.findFoodInfoById({f_id});

        const foodInfoResponseDTO : FoodInfoResponseDTO = {
            statusCode : 200,
            message : '성공적으로 조회했습니다',
            data : foodInfo
        }

        return foodInfoResponseDTO;
    }
    

    async deleteFoodInfoById({ f_id } : { f_id : number }) : Promise<DeleteFoodInfoResponseDTO> {
        await this.foodInfoRepository.deleteFoodInfoById({f_id});
        
        return {
            message : '삭제가 완료되었습니다',
            statusCode : 200,
        }
    }
}