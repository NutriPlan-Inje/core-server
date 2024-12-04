import { Inject, Service } from "typedi";
import { DeleteDietPlanResponseDTO, DietPlanResponseDTO } from "../dto/response/dietPlan";
import DietPlanDTO from "../dto/response/dietPlan";
import DietPlanRepository from "../repositoryes/dietPlan.repository";

@Service()
export default class DietPlanService {
    constructor(
        @Inject( () => DietPlanRepository) private readonly  dietPlanRepository :DietPlanRepository
    ){} 

    private transformDateType = ({ dietPlans }: { dietPlans: DietPlanDTO[] }): DietPlanDTO[] => {
        const result = dietPlans.map((plan) => {
            const date = new Date(plan.date); // 기존 날짜 가져오기
            const formattedDate = date.toISOString().split('T')[0]; // ISO 형식으로 변환 후 날짜 부분만 추출
    
            // 수정된 날짜를 포함한 새로운 객체 반환
            return { ...plan, date: formattedDate };
        });
    
        return result;
    };
    
    private getResponseData({ dietPlans }: { dietPlans: DietPlanDTO[] }): DietPlanResponseDTO {
        const updatedDietPlans: DietPlanDTO[] = this.transformDateType({ dietPlans }); // 함수 호출 추가
    
        const result: DietPlanResponseDTO = {
            statusCode: 200,
            message: '성공적으로 조회했습니다',
            data: updatedDietPlans,
        };
    
        return result;
    }
    
    async findDietPlanByDateAndUid( { date, u_id } : { date : string, u_id : number }) : Promise<DietPlanResponseDTO> {
        try{
            const dietPlans : DietPlanDTO[] = await this.dietPlanRepository.findDietPlanByDateAndUid({date, u_id});
            if(dietPlans.length === 0){
                throw new Error();
            }

            const dietPlanResponseDTO = this.getResponseData({ dietPlans });
            return dietPlanResponseDTO;
        } catch (error) {
            console.error(error);
            return {
                statusCode : 404,
                message : '조회에 실패했습니다',
                data : []
            } as DietPlanResponseDTO;
        }
    }

    async deleteDietPlanById( { id } : { id : number }) : Promise<DeleteDietPlanResponseDTO>{
        await this.dietPlanRepository.deleteDietPlanById({ id });

        return {
            message : '삭제가 완료되었습니다',
            statusCode : 200,
        }
    }
}