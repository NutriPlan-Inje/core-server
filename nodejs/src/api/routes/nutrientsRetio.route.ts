import { Router } from "express"
import Container from "typedi";
import NutrientsRetioController from "../controllers/nutrientsRatio.controller";
import { cacheMiddleware } from "../middlewares/cache.middleware";

export default ({ app } : { app : Router }) => {
    const route = Router();

    app.use('/macronutrientRatio', route);

    const NutrientsRatioController = Container.get(NutrientsRetioController);

    route.get("/day/:u_id/:date",
        cacheMiddleware((req) => `day:${req.params.u_id}:${req.params.date}`),
        NutrientsRatioController.calculateMacronutrientRatioForDay.bind(NutrientsRetioController));
    route.get("/week/:u_id/:date", 
        cacheMiddleware((req) => `week:${req.params.u_id}:${req.params.date}`),
        NutrientsRatioController.evaluateMacronutrientIntakeForWeek.bind(NutrientsRetioController));
    route.get("/evaluate/:u_id/:date", 
    cacheMiddleware((req) => `evaluiate:day:${req.params.u_id}:${req.params.date}`),
        NutrientsRatioController.evaluateMacronutrientIntakeForDay.bind(NutrientsRetioController));
}
