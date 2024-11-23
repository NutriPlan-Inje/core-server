package NutriPlan.controller;

import NutriPlan.Service.FoodService;
import NutriPlan.Service.UserService;
import NutriPlan.model.Dao.User;
import NutriPlan.model.Dto.UserResponseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/spring/api/user")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService){
        this.userService = userService;
    }


    @PostMapping("/userUpdate")
    public ResponseEntity<UserResponseDto> updateUserInfo(
            @RequestParam int userId,
            @RequestParam Integer age,
            @RequestParam Integer height,
            @RequestParam Integer weight,
            @RequestParam Integer gender
    ) {

        User user = userService.updateUserInfo(userId, age, height, weight, gender);


        UserResponseDto responseDto = new UserResponseDto(
                user.getId(),
                user.getNick(),
                user.getBmr()
        );

        return new ResponseEntity<>(responseDto, HttpStatus.OK);
    }
    @DeleteMapping("/delete/{userId}")
    public ResponseEntity<String> deleteUser(@PathVariable int userId) {
        userService.deleteUserByUserId(userId);  // userId를 기반으로 삭제 처리
        return ResponseEntity.ok("User with userId " + userId + " has been deleted.");
    }
}
