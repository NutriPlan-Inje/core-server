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
import java.util.Optional;

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
}
