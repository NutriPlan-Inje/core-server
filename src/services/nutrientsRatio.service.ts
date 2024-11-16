import { Inject, Service } from "typedi";
import FoodInfoDTO from "../dto/response/foodInfo";
import {  MacronutrientRatioForDayResponseDTO, MacronutrientRatioForWeekResponseDTO, MacronutrientRatioResponseDTO } from "../dto/response/nutrientRatio"; 
import DietPlanRepository from "../repositoryes/dietPlan.repository";
import FoodInfoRepository from "../repositoryes/foodInfo.repository";
import DietplanDTO from "../dto/response/dietPlan";
import { EachKcal, DailyMacronutrientSummary, WeekMacronutrientSummary, DailyKcal, MacronutrientType, EvaluateMacronutrient, RecomendMacronutrientType } from "../types/nutrient.type";
import UserRepository from "../repositoryes/user.repository";
import UserDTO from "../dto/response/user";

@Service()
export class NutrientsRatioServie {
    constructor(
        @Inject( () => FoodInfoRepository ) private readonly foodInfoRepository : FoodInfoRepository,
        @Inject( () => DietPlanRepository ) private readonly dietPlanRepository : DietPlanRepository,
        @Inject( () => UserRepository ) private readonly userRepository : UserRepository
    ){}
    //map으로 food_id만 뽑아주는 함수
    private getFoodInfoIdsByUidAndDate({ dietPlan } : { dietPlan : DietplanDTO[] | null }): number[] {
        let foodIds : number[]= [];
        if (dietPlan !== null) {// food_id 값만 추출하여 배열로 저장
            foodIds = dietPlan.map(item => item.food_id);
        }

        return foodIds
    }
    //아점저 별로 섭취한 칼로리 계산해주는 함수
    private async getEachKcal({ dietPlan } : { dietPlan : DietplanDTO[] }): Promise<EachKcal> {
        let morningKcal : number = 0;
        let lunchKcal : number = 0;
        let dinnerKcal : number = 0;

        for(const plan of dietPlan) {
            let f_id = plan.food_id;
            const foodInfo : FoodInfoDTO = await this.foodInfoRepository.findFoodInfoById({ f_id });

            if(plan.mealTime === 1) {
                morningKcal += foodInfo.kcal;
            } else if (plan.mealTime === 2) {
                lunchKcal += foodInfo.kcal;
            } else {
                dinnerKcal += foodInfo.kcal;
            }
        }

        const result : EachKcal = {
            morning : morningKcal,
            lunch : lunchKcal,
            dinner : dinnerKcal
        }

        return result;
    }

    private async Macronutrient({ dietPlan } : { dietPlan : DietplanDTO[] }) : Promise<MacronutrientType>{
        const foodInfoIds :  number[] = this.getFoodInfoIdsByUidAndDate({ dietPlan });
        let carbohydrate : number = 0;
        let protein : number = 0;
        let fat : number = 0;


        for(const f_id of foodInfoIds){
            const foodInfo : FoodInfoDTO = await this.foodInfoRepository.findFoodInfoById({ f_id });
            carbohydrate += Number(foodInfo.carbohydrate);
            protein += Number(foodInfo.protein);
            fat += Number(foodInfo.fat);
        }

        const result : MacronutrientType = {
            carbohydrate : Math.round(carbohydrate),
            protein : Math.round(protein),
            fat : Math.round(fat),
        };

        return result;
    }

    private  calculateRecomendNutrition = ({ userBmr } : { userBmr : number }) :RecomendMacronutrientType=> {
        const ACTIVITY_METABOLISM = 1.375

        //TODO : 계산 같은 거는 함수로 뺴고 함수를 부르는 것이 가독성이 좋음 비즈니스 로직은 가독성이 중요
        const recomendDailyEnergyExpenditure : number =  userBmr * ACTIVITY_METABOLISM; // 활동칼로리 - 가벼운 운동(주1-3회)을 기준

        // 5:2:3 이 적정 비율
        const recomendCarbohydrate : number = Math.round(recomendDailyEnergyExpenditure * 0.5 / 4);
        const recomendProtein : number = Math.round(recomendDailyEnergyExpenditure * 0.2 / 4);
        const recomendFat : number = Math.round(recomendDailyEnergyExpenditure * 0.3 / 9);

        const result: RecomendMacronutrientType = {recomendCarbohydrate, recomendProtein, recomendFat}

        return result;
    }

    private evaluateMacronutrient = ({ recomendMacronutrient, macronutrient } : { recomendMacronutrient : RecomendMacronutrientType,   macronutrient : MacronutrientType }) : EvaluateMacronutrient=> {;
        const evaluateCarbohydrate : string = macronutrient.carbohydrate < recomendMacronutrient.recomendCarbohydrate ? "탄수화물이 부족합니다" : "탄수화물이 충분합니다";
        const evaluateProtein : string = macronutrient.protein < recomendMacronutrient.recomendProtein ? "단백질이 부족합니다" : "단백질이 충분합니다";
        const evaluateFat : string = macronutrient.fat < recomendMacronutrient.recomendFat ? "지방이 부족합니다" : "지방이 충분합니다.";

        const result : EvaluateMacronutrient = {evaluateCarbohydrate, evaluateProtein, evaluateFat};

        return result;
    }

    async evaluateMacronutrientIntakeForDay({ u_id, date } : { u_id : number, date : string}) : Promise<MacronutrientRatioForDayResponseDTO>{
        //섭취한 영양 + 유저의 기초대사량
        const dietPlan : DietplanDTO[]= await this.dietPlanRepository.findDietPlanByDateAndUid({date, u_id});
        const macronutrient : MacronutrientType = await this.Macronutrient({ dietPlan })
        const userInfo : UserDTO = await this.userRepository.getUserInfoByUid({u_id});
        const userBmr = userInfo.bmr;
        
        const recomendMacronutrient : RecomendMacronutrientType = this.calculateRecomendNutrition({ userBmr });
        const resultEvaluate : EvaluateMacronutrient = this.evaluateMacronutrient({ recomendMacronutrient, macronutrient});


        const dailyMacronutrientSummary : DailyMacronutrientSummary = {
            macronutrientRecommendation : recomendMacronutrient,
            intakeMacronutrient : macronutrient,
            evaluate :  resultEvaluate
        }


        const macronutrientRatioForDayResponseDTO : MacronutrientRatioForDayResponseDTO  = {
            statusCode : 200,
            message : "계산을 완료했습니다",
            data :  dailyMacronutrientSummary
        }

        return macronutrientRatioForDayResponseDTO;
    }
    
    async calculateMacronutrientRatioForDay({ u_id, date } : { u_id: number, date : string }): Promise<MacronutrientRatioResponseDTO> {
        const dietPlan : DietplanDTO[]= await this.dietPlanRepository.findDietPlanByDateAndUid({date, u_id});
        
        const eachKcal : EachKcal = await this.getEachKcal({ dietPlan })
        const macronutrient =  await this.Macronutrient({ dietPlan } )

        const total = macronutrient.carbohydrate + macronutrient.protein + macronutrient.fat;
        const macronutrientRatio : MacronutrientType = {
            carbohydrate : Math.round(macronutrient.carbohydrate / total * 100),
            protein : Math.round(macronutrient.protein / total * 100),
            fat : Math.round(macronutrient.fat / total * 100),
        };

        const macronutrientRatioResponseDTO : MacronutrientRatioResponseDTO = {
            statusCode : 200,
            message : '계산을 완료했습니다',
            data : {
                date : date,
                macronutrient : macronutrient,
                macronutrientRatio :  macronutrientRatio, 
                eachKcal : eachKcal
            }
        }

        return macronutrientRatioResponseDTO;
    }

    private getWeekStartAndEnd({ date } : { date: string }): { startOfWeek: string, endOfWeek: string } {
        //TODO: new를 많이 부르는 거는 좋은 형태가 아님
        const givenDate = new Date(date);
        const startOfWeek = new Date(givenDate);
        const endOfWeek = new Date(givenDate);
    
        // 월요일을 기준으로 주 시작일 계산
        startOfWeek.setDate(givenDate.getDate() - (givenDate.getDay() === 0 ? 6 : givenDate.getDay() - 1));
        // 일요일을 기준으로 주 종료일 계산
        endOfWeek.setDate(givenDate.getDate() + (7 - givenDate.getDay()));
    
        return {
            startOfWeek: startOfWeek.toISOString().split('T')[0],
            endOfWeek: endOfWeek.toISOString().split('T')[0]
        };
    }
    
    async calculateMacronutrientRatioForWeek({ u_id, date } : { u_id: number, date : string }) : Promise<MacronutrientRatioForWeekResponseDTO> {
        // u_id에 따른 주간 권장 탄단지 비율 계산 로직
        //calculateMacronutrientRatioForDay 얘를 주회해야 하는 날짜만큼 돌린면 됨
        const { startOfWeek, endOfWeek } = this.getWeekStartAndEnd({date});
        const macronutrients = [];
        const weekKcal : DailyKcal[] = [];
        let cnt : number = 0;

        for(let i = new Date(startOfWeek); i <= new Date(endOfWeek); i.setDate(i.getDate() + 1)) {
            // 날짜별 작업 수행
            let date = i.toISOString().split('T')[0]
            let tmp = await this.calculateMacronutrientRatioForDay({u_id, date});
            macronutrients.push(tmp.data);

            //reduce나 map으로 해보기 
            if (tmp && tmp.data) {
                macronutrients.push(tmp.data);
                
                if (tmp.data.eachKcal && tmp.data.date) {
                    weekKcal[cnt] = {
                        date: tmp.data.date,
                        intakeKcal: tmp.data.eachKcal.dinner + tmp.data.eachKcal.lunch + tmp.data.eachKcal.morning
                    };
                    cnt++;
                }
            }
        }

        let carbohydrate : number = 0;
        let  protein : number = 0;
        let fat : number = 0;

        for (let i = 0; i < macronutrients.length; i++) {
            const nutrient = macronutrients[i];
    
            if (nutrient && nutrient.macronutrient) {
                if (nutrient.macronutrient.carbohydrate !== undefined) {
                    carbohydrate += nutrient.macronutrient.carbohydrate;
                }
                if (nutrient.macronutrient.protein !== undefined) {
                    protein += nutrient.macronutrient.protein;
                }
                if (nutrient.macronutrient.fat !== undefined) {
                    fat += nutrient.macronutrient.fat;
                }
            }
        }

        let total = carbohydrate + protein + fat;
        //TODO: 밖에서 계산하고 넣기
        const weekMacronutrientSummary: WeekMacronutrientSummary = {
            macronutrientRatio: {
                carbohydrate: Math.round((carbohydrate / total) * 100), 
                protein: Math.round((protein / total) * 100),           
                fat: Math.round((fat / total) * 100),                 
            },
            kcal : weekKcal
        };
        
        const macronutrientRatioForWeekResponseDTO : MacronutrientRatioForWeekResponseDTO = {
            statusCode: 200,
            message : "계산을 완료했습니다",
            data : weekMacronutrientSummary
        }

        return macronutrientRatioForWeekResponseDTO;
    }
}