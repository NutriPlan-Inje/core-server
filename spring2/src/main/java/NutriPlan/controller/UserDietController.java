package NutriPlan.controller;

import NutriPlan.Repository.FoodInfoRepository;
import NutriPlan.Repository.UserDietPlanRepository;
import NutriPlan.Repository.UserRepository;
import NutriPlan.Service.FoodInfoService;
import NutriPlan.Service.FoodService;
import NutriPlan.Service.UserDietPlanService;
import NutriPlan.model.Dao.FoodInfo;
import NutriPlan.model.Dao.User;
import NutriPlan.model.Dao.UserDietPlan;
import NutriPlan.model.Dto.FoodNutrientDto;
import NutriPlan.model.Dto.UserDietDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/spring/api")
public class UserDietController {

    private final FoodInfoService foodInfoService;
    private final UserDietPlanService userDietPlanService;

    private final FoodService foodService;

    public UserDietController(FoodService foodService, FoodInfoService foodInfoService, UserDietPlanService userDietPlanService) {
        this.foodService = foodService;
        this.foodInfoService = foodInfoService;
        this.userDietPlanService = userDietPlanService;
    }

    @PostMapping("/addFood")
    public ResponseEntity<String> addFoodToDietPlan(@RequestBody Map<String, Object> requestData) {
        try{
            Map<String, Object> data = (Map<String, Object>) requestData.get("data");

            int userId = Integer.valueOf(data.get("userId").toString());
            String foodName = data.get("foodName").toString();
            double kcal = Double.parseDouble(data.get("kcal").toString());
            int servingSize = Integer.parseInt(data.get("servingSize").toString());
            double protein = Double.parseDouble(data.get("protein").toString());
            double fat = Double.parseDouble(data.get("fat").toString());
            double carbohydrate = Double.parseDouble(data.get("carbohydrate").toString());
            int mealTime = Integer.parseInt(data.get("mealTime").toString());

            FoodNutrientDto foodDto = new FoodNutrientDto();
            foodDto.setFoodName(foodName);
            foodDto.setKcal(kcal);
            foodDto.setCarbohydrate(carbohydrate);
            foodDto.setProtein(protein);
            foodDto.setFat(fat);
            foodDto.setServingSize(servingSize);

            foodService.saveFoodForUser(userId, foodDto, mealTime);


            return ResponseEntity.ok("식단이 추가되었습니다.");

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("식단 추가 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
}
