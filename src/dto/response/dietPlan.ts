import { CommonResponseDTO } from ".";

export default interface DietPlanDTO {
    id : number;
    user_id : number;
    food_id : number;
    date : string;
    mealTime : number;
}

/**
 * 이런 ㅅ형태로 바꾸기
 * interface DietplanArrayDTO {
    dietplanDTO: DietplanDTO[]
}
 */

export interface DietPlanResponseDTO extends CommonResponseDTO<DietPlanDTO[]>{}
export interface DeleteDietPlanResponseDTO extends CommonResponseDTO<null>{}