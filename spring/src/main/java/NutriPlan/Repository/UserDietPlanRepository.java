package NutriPlan.Repository;

import NutriPlan.model.Dao.UserDietPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface UserDietPlanRepository extends JpaRepository<UserDietPlan, Integer> {
    //void saveUserDietPlan(Long userId, Long foodId);
    List<UserDietPlan> findByUserIdAndMealTimeAndDate(int userId, int mealTime, LocalDate date);
}