package NutriPlan.model.Dao;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import jakarta.persistence.Table;

@Entity
@Table(name = "foodInfo")
public class FoodInfo {
    @jakarta.persistence.Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column(nullable = false)
    private String foodName;
    @Column(nullable = false)
    private int servingSize;
    @Column(nullable = false)
    private double kcal;
    @Column(nullable = false)
    private double protein;
    @Column(nullable = false)
    private double fat;
    @Column(nullable = false)
    private double carbohydrate;
    public FoodInfo() {
    }

    public FoodInfo(String foodName, double kcal, double carbohydrate, double protein, double fat, int servingSize) {
        this.foodName = foodName;
        this.kcal = kcal;
        this.carbohydrate = carbohydrate;
        this.protein = protein;
        this.fat = fat;
        this.servingSize = servingSize;
    }
    public int getFoodId() {
        return id;
    }

    public void setFoodId(int foodId) {
    }
    public String getFoodName() {
        return foodName;
    }

    public void setFoodName(String foodName) {
        this.foodName = foodName;
    }

    public int getServingSize() {
        return servingSize;
    }

    public void setServingSize(int servingSize) {
        this.servingSize = servingSize;
    }

    public double getKcal() {
        return kcal;
    }

    public void setKcal(double kcal) {
        this.kcal = kcal;
    }

    public double getProtein() {
        return protein;
    }

    public void setProtein(double protein) {
        this.protein = protein;
    }

    public double getFat() {
        return fat;
    }

    public void setFat(double fat) {
        this.fat = fat;
    }

    public double getCarbohydrate() {
        return carbohydrate;
    }

    public void setCarbohydrate(double carbohydrate) {
        this.carbohydrate = carbohydrate;
    }



}
