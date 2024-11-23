package NutriPlan.controller;

import NutriPlan.Service.KakaoService;
import NutriPlan.Service.UserService;
import NutriPlan.model.Dto.KakaoUserInfoDto;
import com.fasterxml.jackson.core.JsonProcessingException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Controller
public class KakaoLogin {
    private final KakaoService kakaoService;
    private final UserService userService;

    public KakaoLogin(KakaoService kakaoService, UserService userService) {
        this.kakaoService = kakaoService;
        this.userService = userService;
    }

    @GetMapping("/spring/login/oauth2/code/kakao")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> kakaoLogin(@RequestParam String code) throws JsonProcessingException {
        String token = kakaoService.kakaoLogin(code);

        KakaoUserInfoDto userInfo = kakaoService.getKakaoUserInfo(token);
        Long kakaoId = userInfo.getKakaoId();
        String nick = userInfo.getNick();

        if (kakaoId == null) {
            System.out.println("Kakao ID가 null입니다.");
            return ResponseEntity.badRequest().body(Map.of("error", "Kakao ID가 null입니다."));
        }

        long userId = userService.saveUser(kakaoId, nick);


        Map<String, Object> response = new HashMap<>();
        response.put("nickname", nick);
        response.put("userId", userId);
        response.put("access_token", token);

        System.out.println("CODE: " + code);
        System.out.println("userId: " + userId);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/spring/kakao/login")
    public String login(){
        String kakaoAuthUrl = kakaoService.getKakaoAuthUrl();
        return "redirect:" + kakaoAuthUrl;

    }

    //로그아웃
    @GetMapping("/spring/kakao/logout")
    public String kakaoLogout(
            @RequestParam("userId") int userId,  // 삭제할 사용자 ID
            @RequestParam("access_token") String accessToken,  // 카카오 access_token
            HttpServletRequest request,  // HttpServletRequest to invalidate session
            HttpServletResponse response  // HttpServletResponse to handle cookies
    ) {
        try {
            // 카카오 로그아웃 API 호출
            kakaoService.kakaoLogout(accessToken); // KakaoService에서 로그아웃 처리

            // 사용자 삭제 (userId로 사용자 삭제)
            userService.deleteUserByUserId(userId);

            // 세션 무효화
            request.getSession().invalidate();

            // 'access_token' 쿠키 삭제
            Cookie cookie = new Cookie("access_token", null);
            cookie.setMaxAge(0);  // 쿠키를 즉시 만료
            cookie.setPath("/");  // 모든 경로에서 쿠키 삭제
            response.addCookie(cookie);

            // 로그아웃 후 /logout으로 리다이렉트
            return "redirect:/logout";  // 리다이렉트 URL
        } catch (Exception e) {
            e.printStackTrace();
            return "로그아웃 중 오류가 발생했습니다.";  // 오류 메시지 반환
        }
        }

    @GetMapping("/logout")  // 로그아웃 후 리다이렉트될 URL
    public String redirectToLogoutPage() {
        return "로그아웃이 완료되었습니다. 다시 로그인 해주세요.";
    }
}