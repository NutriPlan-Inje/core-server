import Router from "express";
import dietPlan from "./routes/dietPlan.route";
import foodInfo from "./routes/foodInfo.route";
import nutrientsRatio from "./routes/nutrientsRetio.route"

export default () => {
    const router= Router();
    
    dietPlan({ app : router });
    foodInfo({ app : router });
    nutrientsRatio({ app : router });
    
    return router;
}