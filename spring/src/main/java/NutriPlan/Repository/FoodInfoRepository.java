package NutriPlan.Repository;

import NutriPlan.Service.FoodInfoService;
import NutriPlan.model.Dao.FoodInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FoodInfoRepository extends JpaRepository<FoodInfo, Integer> {
    Optional<FoodInfo> findByFoodName(String foodName);
}