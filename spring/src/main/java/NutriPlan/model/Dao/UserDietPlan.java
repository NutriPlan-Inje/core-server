package NutriPlan.model.Dao;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "userDietPlan")
public class UserDietPlan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne(fetch = FetchType.LAZY)  // 지연 로딩 추가
    @JoinColumn(name = "user_id", referencedColumnName = "id",nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)  // 지연 로딩 추가
    @JoinColumn(name = "food_id", referencedColumnName = "id",nullable = false)
    private FoodInfo foodInfo;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private int mealTime;

    public UserDietPlan() {
    }

    public UserDietPlan(User user, FoodInfo foodInfo, LocalDate now, int mealTime) {
        this.user = user;
        this.foodInfo = foodInfo;
        this.date = now;
        this.mealTime = mealTime;
    }

    // Getter & Setter methods

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public FoodInfo getFoodInfo() {
        return foodInfo;
    }

    public void setFoodInfo(FoodInfo foodInfo) {
        this.foodInfo = foodInfo;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public int getMealTime() {
        return mealTime;
    }

    public void setMealTime(int mealTime) {
        this.mealTime = mealTime;
    }
}
