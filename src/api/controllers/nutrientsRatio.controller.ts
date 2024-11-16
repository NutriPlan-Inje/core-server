import { NextFunction, Request, Response } from "express";
import { Inject, Service } from "typedi";
import { MacronutrientRatioForDayResponseDTO, MacronutrientRatioResponseDTO } from "../../dto/response/nutrientRatio";
import { NutrientsRatioServie } from "../../services/nutrientsRatio.service";

@Service()
export default class NutrientsRatioController {
    constructor(
        @Inject( () => NutrientsRatioServie ) private readonly nutrientsRatioServie : NutrientsRatioServie
    ){}

    calculateMacronutrientRatioForDay = async (req : Request, res : Response, next : NextFunction) => {
        const u_id : number = parseInt(req.params.u_id);
        const date : string = req.params.date;
        const macronutrientRatioResponseDTO : MacronutrientRatioResponseDTO = await this.nutrientsRatioServie.calculateMacronutrientRatioForDay({ u_id, date });
        return res.status(200).json(macronutrientRatioResponseDTO);
    }

    evaluateMacronutrientIntakeForDay = async (req : Request, res : Response, next : NextFunction) => {
        const u_id : number = parseInt(req.params.u_id);
        const date : string = req.params.date;
        const macronutrientRatioForDayResponseDTO : MacronutrientRatioForDayResponseDTO = await this.nutrientsRatioServie.evaluateMacronutrientIntakeForDay({ u_id, date });
        return res.status(200).json(macronutrientRatioForDayResponseDTO);
    }

    evaluateMacronutrientIntakeForWeek = async (req : Request, res : Response, next : NextFunction) => {
        const u_id : number = parseInt(req.params.u_id);
        const date : string = req.params.date;
        const re = await this.nutrientsRatioServie.calculateMacronutrientRatioForWeek({ u_id, date });
        return res.status(200).json(re);
    }
}