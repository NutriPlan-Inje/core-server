package NutriPlan.model.Dto;

public class KakaoUserInfoDto {
    private Long kakaoId;
    private String nick;
    //private String email;

    public KakaoUserInfoDto(Long id, String nick) {
        this.kakaoId = id;
        this.nick = nick;
    }

    public Long getKakaoId() {
        return kakaoId;
    }

    public void setKakaoId(Long id) {
        this.kakaoId  = kakaoId ;
    }

    public String getNick() {
        return nick;
    }

    public void setNick(String nick) {
        this.nick = nick;
    }



}

