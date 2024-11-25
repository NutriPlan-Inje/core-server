import { CommonResponseDTO } from ".";

export default interface DietPlanDTO {
    id : number;
    date : string;
    mealTime : number;
    food_id : number;
    user_id : number;
}

export interface DietPlanResponseDTO extends CommonResponseDTO<DietPlanDTO[]>{}
export interface DeleteDietPlanResponseDTO extends CommonResponseDTO<null>{}