package NutriPlan.model.Dao;




import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Entity
@Table(name = "user")
public class User {

    //@jakarta.persistence.Id
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "kakao_id",unique = true, nullable = false)
    private Long kakaoId;

    @Column(name = "nick", length = 15,nullable = true)
    private String nick;

    @Column(nullable = true)
    private Integer height;

    @Column(nullable = true)
    private Integer weight;

    @Column(nullable = true)
    private Integer age;

    @Column(nullable = true)
    private Integer bmr;

    @Column(nullable = true)
    private Integer gender;

    public User() {}

    public User(Long kakaoId,String nick,Integer height, Integer weight, Integer age, Integer bmr,Integer gender){
        this.kakaoId = kakaoId;
        this.nick = nick;
        this.height = height;
        this.weight = weight;
        this.age = age;
        this.bmr = bmr;
        this.gender = gender;
    }

    public int getId(){
        return id;
    }
    public void setId(int id) {
        this.id = id;
    }
    public Long getKakaoId() {
        return kakaoId;
    }
    public void setKakaoId(Long kakaoId) {
        this.kakaoId = kakaoId;
    }
    public String getNick(){
        return nick;
    }
    public void setNick(String nick) {
        this.nick = nick;
    }
    public Integer getHeight(){
        return height;
    }
    public void setHeight(Integer height) {
        this.height = height;
    }

    public Integer getWeight(){
        return weight;
    }
    public void setWeight(Integer weight) {
        this.weight = weight;
    }

    public Integer getAge(){
        return age;
    }
    public void setAge(Integer age) {
        this.age = age;
    }
    public Integer getBmr(){
        return bmr;
    }
    public void setBmr(Integer bmr) {
        this.bmr = bmr;
    }

    public Integer getGender(){
        return gender;
    }
    public void setGender(Integer gender) {
        this.gender = gender;
    }

}
