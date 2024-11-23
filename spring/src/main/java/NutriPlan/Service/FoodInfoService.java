package NutriPlan.Service;

import NutriPlan.Repository.FoodInfoRepository;
import NutriPlan.model.Dao.FoodInfo;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class FoodInfoService {
    private final FoodInfoRepository foodInfoRepository;

    public FoodInfoService(FoodInfoRepository foodInfoRepository){
        this.foodInfoRepository = foodInfoRepository;
    }

    public int findOrSaveFood(FoodInfo foodInfo) {
        return foodInfoRepository.findByFoodName(foodInfo.getFoodName())
                .map(FoodInfo::getFoodId)
                .orElseGet(() -> foodInfoRepository.save(foodInfo).getFoodId());
    }
}
