package NutriPlan.model.Dto;

public class UserResponseDto {
    private int userId;
    private String nick;
    private Integer bmr;

    public UserResponseDto(int userId, String nick, Integer bmr) {
        this.userId = userId;
        this.nick = nick;
        this.bmr = bmr;
    }

    public int getUserId() {
        return userId;
    }

    public String getNick() {
        return nick;
    }

    public Integer getBmr() {
        return bmr;
    }
}
