import { Inject, Service } from "typedi";
import FoodInfoDTO from "../dto/response/foodInfo";
import { MacronutrientRatioForDayResponseDTO, MacronutrientRatioForWeekResponseDTO, MacronutrientRatioResponseDTO } from "../dto/response/nutrientRatio"; 
import DietPlanRepository from "../repositoryes/dietPlan.repository";
import FoodInfoRepository from "../repositoryes/foodInfo.repository";
import DietplanDTO from "../dto/response/dietPlan";
import { EachKcal, DailyMacronutrientSummary, WeekMacronutrientSummary, DailyKcal, MacronutrientType, EvaluateMacronutrient, RecomendMacronutrientType, DailyTotalMacronutrientType } from "../types/nutrient.type";
import UserRepository from "../repositoryes/user.repository";
import UserDTO from "../dto/response/user";

@Service()
export class NutrientsRatioServie {
    constructor(
        @Inject( () => FoodInfoRepository ) private readonly foodInfoRepository : FoodInfoRepository,
        @Inject( () => DietPlanRepository ) private readonly dietPlanRepository : DietPlanRepository,
        @Inject( () => UserRepository ) private readonly userRepository : UserRepository
    ){}

    async calculateMacronutrientRatioForDay({ u_id, date }: { u_id: number; date: string }): Promise<MacronutrientRatioResponseDTO> {
        try {
            const dietPlan: DietplanDTO[] = await this.dietPlanRepository.findDietPlanByDateAndUid({ date, u_id });
            if (dietPlan.length === 0) {
                throw new Error("can not found dietPlan");
            }
    
            const eachKcal: EachKcal = await this.getEachKcal({ dietPlan });
            const macronutrient : MacronutrientType = await this.getMacronutrient({ dietPlan });
            const macronutrientRatio : MacronutrientType = this.getMacronutrientRatio({ macronutrient });
    
            const macronutrientRatioResponseDTO: MacronutrientRatioResponseDTO = {
                statusCode: 200,
                message: '계산을 완료했습니다',
                data: {
                    date: date,
                    macronutrient: macronutrient,
                    macronutrientRatio: macronutrientRatio,
                    eachKcal: eachKcal,
                },
            };
    
            return macronutrientRatioResponseDTO;
    
        } catch (error) {
            console.error(error);
            return {
                statusCode: 404,
                message: '계산에 실패했습니다.',
                data: null,
            } as MacronutrientRatioResponseDTO;
        }
    }

    async calculateMacronutrientRatioForWeek({ u_id, date }: { u_id: number, date: string }): Promise<MacronutrientRatioForWeekResponseDTO> {
        try {
            const {macronutrient, weekKcal} = await this.getMacronutrientAndWeekKcal({ u_id, date });
            const macronutrientRatio: MacronutrientType = this.getMacronutrientRatioForWeek(macronutrient)
    
            const weekMacronutrientSummary: WeekMacronutrientSummary = {
                macronutrientRatio,
                kcal: weekKcal,
            };

            const macronutrientRatioForWeekResponseDTO : MacronutrientRatioForWeekResponseDTO = {
                statusCode: 200,
                message: "계산을 완료했습니다",
                data: weekMacronutrientSummary,
            }
    
            return macronutrientRatioForWeekResponseDTO;
        } catch (error) {
            console.error(error);
            return {
                statusCode: 404,
                message: "계산에 실패했습니다",
                data: null,
            } as MacronutrientRatioForWeekResponseDTO;
        }
    }

    async evaluateMacronutrientIntakeForDay({ u_id, date } : { u_id : number, date : string}) : Promise<MacronutrientRatioForDayResponseDTO>{
        try{
            //섭취한 영양 + 유저의 기초대사량
            const userInfo : UserDTO = await this.userRepository.getUserInfoByUid({u_id});
            if (userInfo === undefined) {
                throw new Error("can not found user");
            }
            const dietPlan : DietplanDTO[]= await this.dietPlanRepository.findDietPlanByDateAndUid({date, u_id});
            if(dietPlan.length === 0){
                throw new Error("can not found dietPlan");
            }
            
            const macronutrient : MacronutrientType = await this.getMacronutrient({ dietPlan })
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
        } catch (error : any) {
            console.error(error)
            return  {
                statusCode : 404,
                message : "조회에 실패했습니다",
                data :  null
            } as MacronutrientRatioForDayResponseDTO;
        }
    }

    private getFoodInfoIdsByUidAndDate({ dietPlan } : { dietPlan : DietplanDTO[] | null }): number[] {
        let foodIds : number[]= [];
        if (dietPlan !== null) {// food_id 값만 추출하여 배열로 저장
            foodIds = dietPlan.map(item => item.food_id);
        }

        return foodIds
    }

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

    private async getMacronutrient({ dietPlan } : { dietPlan : DietplanDTO[] }) : Promise<MacronutrientType>{
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

        const recomendDailyEnergyExpenditure : number =  userBmr * ACTIVITY_METABOLISM; // 활동칼로리 - 가벼운 운동(주1-3회)을 기준
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

    private getWeekStartAndEnd({ date } : { date: string }): { startOfWeek: string, endOfWeek: string } {
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

            
    private getMacronutrientRatio = ({ macronutrient } : { macronutrient : MacronutrientType }) : MacronutrientType=> {
        const totalMacronutrient = macronutrient.carbohydrate + macronutrient.protein + macronutrient.fat;

        const rawRatios = {
            carbohydrate: macronutrient.carbohydrate / totalMacronutrient * 100,
            protein: macronutrient.protein / totalMacronutrient * 100,
            fat: macronutrient.fat / totalMacronutrient * 100,
        };

        let macronutrientRatio: MacronutrientType = {
            carbohydrate: Math.round(rawRatios.carbohydrate),
            protein: Math.round(rawRatios.protein),
            fat: Math.round(rawRatios.fat),
        };
        
        let totalRatio = macronutrientRatio.carbohydrate + macronutrientRatio.protein + macronutrientRatio.fat;
        if (totalRatio !== 100) {
            const diffs = {
                carbohydrate: rawRatios.carbohydrate - macronutrientRatio.carbohydrate,
                protein: rawRatios.protein - macronutrientRatio.protein,
                fat: rawRatios.fat - macronutrientRatio.fat,
            };
            
            // 가장 큰 오차를 가진 키 찾기
            const adjustKey = Object.keys(diffs).reduce((a, b) =>
                Math.abs(diffs[a as keyof MacronutrientType]) > Math.abs(diffs[b as keyof MacronutrientType]) ? a : b
            ) as keyof MacronutrientType;
            
            // 비율 보정
            macronutrientRatio[adjustKey] += (totalRatio < 100 ? 1 : -1);
        }

        return macronutrientRatio;
    }

    private calculateMacronutrientRatio = async({ u_id, date }: { u_id: number, date: string }) : Promise<DailyTotalMacronutrientType>=> {
        const dietPlan: DietplanDTO[] = await this.dietPlanRepository.findDietPlanByDateAndUid({ date, u_id });
        if (dietPlan.length === 0) {
            const dailyTotalMacronutrientType : DailyTotalMacronutrientType = {
                macronutrientRatio :  {
                    carbohydrate : 0,
                    protein : 0,
                    fat : 0
                },
                eachKcal : {
                    morning : 0,
                    lunch : 0,
                    dinner : 0,
                }
            }

            return dailyTotalMacronutrientType;
        }

        const macronutrient : MacronutrientType = await this.getMacronutrient({ dietPlan });
        const macronutrientRatio : MacronutrientType = this.getMacronutrientRatio({ macronutrient });
        const eachKcal: EachKcal = await this.getEachKcal({ dietPlan });

        const result: DailyTotalMacronutrientType = {
            macronutrientRatio,
            eachKcal,
        };
        return result;
    }

    private  getMacronutrientAndWeekKcal = async({ u_id, date }: { u_id: number, date: string }) => {
        const { startOfWeek, endOfWeek } = this.getWeekStartAndEnd({ date });
        const macronutrient : MacronutrientType[]= [];
        const weekKcal: DailyKcal[] = []; 

        let cnt: number = 0;
        for (let i = new Date(startOfWeek); i <= new Date(endOfWeek); i.setDate(i.getDate() + 1)) {
            // 날짜별 작업 수행
            const dayDate = i.toISOString().split('T')[0];
            console.log("‼❌week date =-===" + dayDate);

            const tmp = await this.calculateMacronutrientRatio({ u_id, date: dayDate });
            if (tmp) {
                const data = tmp ;
                macronutrient.push(tmp.macronutrientRatio);

                if (tmp.eachKcal) {
                    weekKcal[cnt] = {
                        date: dayDate,
                        intakeKcal: tmp.eachKcal.dinner + tmp.eachKcal.lunch + tmp.eachKcal.morning,
                    };
                    cnt++;
                }
            }
        }

        return {macronutrient,weekKcal};
    }

    private getMacronutrientRatioForWeek = (macronutrients : MacronutrientType[]) : MacronutrientType => {
        let totalMacronutrient = 0;
        let rawRatios : MacronutrientType = {
            carbohydrate: 0,
            protein: 0,
            fat: 0
        };
        for(const macronutrient of macronutrients) {
            totalMacronutrient = macronutrient.carbohydrate + macronutrient.protein + macronutrient.fat;
            rawRatios.carbohydrate += macronutrient.carbohydrate;
            rawRatios.protein += macronutrient.protein;
            rawRatios.fat += macronutrient.fat;
        }

    
        rawRatios.carbohydrate = rawRatios.carbohydrate / totalMacronutrient * 100;
        rawRatios.protein = rawRatios.protein / totalMacronutrient * 100;
        rawRatios.fat = rawRatios.fat / totalMacronutrient * 100;
    

        let macronutrientRatio: MacronutrientType = {
            carbohydrate: Math.round(rawRatios.carbohydrate),
            protein: Math.round(rawRatios.protein),
            fat: Math.round(rawRatios.fat),
        };
        
        let totalRatio = macronutrientRatio.carbohydrate + macronutrientRatio.protein + macronutrientRatio.fat;
        if (totalRatio !== 100) {
            const diffs = {
                carbohydrate: rawRatios.carbohydrate - macronutrientRatio.carbohydrate,
                protein: rawRatios.protein - macronutrientRatio.protein,
                fat: rawRatios.fat - macronutrientRatio.fat,
            };
            
            // 가장 큰 오차를 가진 키 찾기
            const adjustKey = Object.keys(diffs).reduce((a, b) =>
                Math.abs(diffs[a as keyof MacronutrientType]) > Math.abs(diffs[b as keyof MacronutrientType]) ? a : b
            ) as keyof MacronutrientType;
            
            // 비율 보정
            macronutrientRatio[adjustKey] += (totalRatio < 100 ? 1 : -1);
        }

        return macronutrientRatio;
    }

}