import { CommonResponseDTO } from ".";

export default interface DietPlanDTO {
    id : number;
    user_id : number;
    food_id : number;
    date : string;
    mealTime : number;
}

export interface DietPlanResponseDTO extends CommonResponseDTO<DietPlanDTO[]>{}
export interface DeleteDietPlanResponseDTO extends CommonResponseDTO<null>{}