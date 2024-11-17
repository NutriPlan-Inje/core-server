import { Inject, Service } from "typedi";
import { DeleteDietPlanResponseDTO, DietPlanResponseDTO } from "../dto/response/dietPlan";
import DietPlanDTO from "../dto/response/dietPlan";
import DietPlanRepository from "../repositoryes/dietPlan.repository";

@Service()
export default class DietPlanService {
    constructor(
        @Inject( () => DietPlanRepository) private readonly  dietPlanRepository :DietPlanRepository
    ){} 

    async findDietPlanByDateAndUid( { date, u_id } : { date : string, u_id : number }) : Promise<DietPlanResponseDTO> {
        const dietPlans : DietPlanDTO[] = await this.dietPlanRepository.findDietPlanByDateAndUid({date, u_id});

        const updatedDietPlans = dietPlans.map((plan) => {
            const date = new Date(plan.date); // 기존 날짜 가져오기
            date.setDate(date.getDate() + 1); // 날짜에 하루 더하기
            const formattedDate = date.toISOString().split('T')[0]; // ISO 형식으로 변환 후 날짜 부분만 추출
            
            // 수정된 날짜를 포함한 새로운 객체 반환
            return { ...plan, date: formattedDate };
        });

        //TODO : 조건문 사용해 값을 못 받아온 경우 처리하기

        const dietPlanResponseDTO : DietPlanResponseDTO = {
            statusCode : 200,
            message : '성공적으로 조회했습니다',
            data : updatedDietPlans
        }
        return dietPlanResponseDTO;
    }

    async deleteDietPlanById( { id } : { id : number }) : Promise<DeleteDietPlanResponseDTO>{
        await this.dietPlanRepository.deleteDietPlanById({ id });

        return {
            message : '삭제가 완료되었습니다',
            statusCode : 200,
        }
    }
}