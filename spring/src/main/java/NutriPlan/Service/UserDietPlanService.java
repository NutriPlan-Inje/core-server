package NutriPlan.Service;

import NutriPlan.Repository.FoodInfoRepository;
import NutriPlan.Repository.UserDietPlanRepository;
import NutriPlan.Repository.UserRepository;
import NutriPlan.model.Dao.FoodInfo;
import NutriPlan.model.Dao.User;
import NutriPlan.model.Dao.UserDietPlan;
import NutriPlan.model.Dto.FoodNutrientDto;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

@Service
public class UserDietPlanService {
    private final UserDietPlanRepository userDietPlanRepository;
    private final UserRepository userRepository;
    private final FoodInfoRepository foodInfoRepository;

    public UserDietPlanService(UserDietPlanRepository userDietPlanRepository,
                               UserRepository userRepository,
                               FoodInfoRepository foodInfoRepository) {
        this.userDietPlanRepository = userDietPlanRepository;
        this.userRepository = userRepository;
        this.foodInfoRepository = foodInfoRepository;
    }
    public List<Map<String, Object>> getDietPlan(int userId, int mealTime, LocalDate date) {
        // UserDietPlanRepository를 통해 데이터 조회
        List<UserDietPlan> dietPlans = userDietPlanRepository.findByUserIdAndMealTimeAndDate(userId, mealTime, date);

        // 결과 데이터를 Map 형식으로 변환
        List<Map<String, Object>> result = new ArrayList<>();
        for (UserDietPlan plan : dietPlans) {
            Map<String, Object> map = new HashMap<>();
            map.put("foodName", plan.getFoodInfo().getFoodName());
            map.put("kcal", plan.getFoodInfo().getKcal());
            result.add(map);
        }

        return result;
    }
}
