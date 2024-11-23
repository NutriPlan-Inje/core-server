package NutriPlan.controller;

import NutriPlan.Service.FoodService;
import NutriPlan.model.Dto.FoodNutrientDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/spring/api/foods")
public class FoodController {
    private final FoodService foodService;

    public FoodController(FoodService foodService){
        this.foodService = foodService;
    }

    @GetMapping("/foodSearch")
    public List<FoodNutrientDto> getFoodList(@RequestParam String foodName){
        try {
            return foodService.searchFood(foodName);
        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }
}
