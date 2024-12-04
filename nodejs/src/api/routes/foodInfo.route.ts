import { Router } from "express"
import Container from "typedi";
import { FoodInfoController } from "../controllers/foodInfo.controller";
import { cacheMiddleware } from "../middlewares/cache.middleware";

export default ({ app } : { app : Router }) => {
    const route = Router();

    app.use('/foodInfo', route);

    route.get("/:f_id", 
        cacheMiddleware((req) => `foodInfo:${req.params.f_id}`),
        Container.get(FoodInfoController).findFoodInfoById.bind(FoodInfoController));
    route.delete("/:f_id", Container.get(FoodInfoController).deleteFoodInfoById.bind(FoodInfoController));
}