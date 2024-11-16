type EachKcal={
    morning : number;
    lunch : number;
    dinner : number;
}

type MacronutrientType = {
    carbohydrate : number;
    protein : number;
    fat : number;
}

type RecomendMacronutrientType = {
    recomendCarbohydrate : number;
    recomendProtein : number;
    recomendFat : number;
}

type EvaluateMacronutrient = {
    evaluateCarbohydrate : string;
    evaluateProtein : string;
    evaluateFat : string ;
}
type DailyMacronutrientSummary = {
    macronutrientRecommendation : RecomendMacronutrientType,
    intakeMacronutrient : MacronutrientType,
    evaluate : EvaluateMacronutrient
}

type DailyKcal = {
    date : string;
    intakeKcal : number;
}

type WeekMacronutrientSummary = {
    macronutrientRatio : MacronutrientType;
    kcal : DailyKcal[];
}

export {EachKcal, MacronutrientType, RecomendMacronutrientType, EvaluateMacronutrient,  DailyMacronutrientSummary, WeekMacronutrientSummary, DailyKcal} ;