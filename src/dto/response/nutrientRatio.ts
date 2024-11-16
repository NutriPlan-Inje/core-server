import { CommonResponseDTO } from ".";
import { DailyMacronutrientSummary, EachKcal, MacronutrientType, WeekMacronutrientSummary } from "../../types/nutrient.type";

export interface MacronutrientRatioDTO { //탄단지 비율을 %로 해서 보냄
    date : string;
    macronutrient : MacronutrientType;
    macronutrientRatio : MacronutrientType;
    eachKcal : EachKcal;
}

export interface MacronutrientRatioResponseDTO extends CommonResponseDTO<MacronutrientRatioDTO>{}
export interface MacronutrientRatioForDayResponseDTO extends CommonResponseDTO<DailyMacronutrientSummary>{}
export interface MacronutrientRatioForWeekResponseDTO extends CommonResponseDTO<WeekMacronutrientSummary>{}