import Joi from "joi";

export const dietPlanDateValidator = Joi.object({
    data : Joi.string().required(),
}).unknown(false);