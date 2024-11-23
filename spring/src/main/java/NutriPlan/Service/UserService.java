package NutriPlan.Service;


import NutriPlan.Repository.UserRepository;
import NutriPlan.model.Dao.User;
import jakarta.persistence.EntityManagerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EntityManagerFactory entityManagerFactory;


    public int saveUser(Long kakaoId, String nick){
        Optional<User> optionalUser = userRepository.findByKakaoId(kakaoId);

        User user = optionalUser.orElseGet(() -> {
            User newUser = new User();
            newUser.setKakaoId(kakaoId);
            newUser.setNick(nick);
            userRepository.save(newUser);
            System.out.println("새 사용자 생성됨: kakaoId = " + kakaoId + ", nickname = " + nick);
            return newUser;
        });

        System.out.println("기존 사용자 존재: ID = " + user.getId());
        return user.getId();
    }

//    public int getUserIdByKakaoId(int kakaoId) {
//        User user = userRepository.findByKakaoId(kakaoId);
//
//        if (user == null) {
//            System.out.println("해당 kakaoId에 대한 사용자가 없습니다.");
//            return 0;
//        }
//        System.out.println("getUserIdByKakaoId="+user.getId());
//        return user.getId();
//    }

    public User updateUserInfo(int userId, Integer age, Integer height, Integer weight, Integer gender) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("해당 ID의 사용자가 존재하지 않습니다."));

        if (age == null || height == null || weight == null || gender == null) {
            throw new IllegalArgumentException("모든 값을 입력해야 합니다.");
        }

        user.setAge(age);
        user.setHeight(height);
        user.setWeight(weight);
        user.setGender(gender);

        int bmr = calculateBmr(height, weight, age, gender);
        user.setBmr(bmr);

        userRepository.save(user);
        return user;
    }


    private int calculateBmr(int height, int weight, int age, int gender) {
        if (gender == 1) {  // 남성
            return (int) (88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age));
        } else {  // 여성
            return (int) (447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age));
        }
    }

    public Optional<User> findById(int id) {
        return userRepository.findById(id);
    }

    // user ID로 사용자 삭제
    public void deleteUserByUserId(int userId) {
        Optional<User> optionalUser = userRepository.findById(userId);  // userId로 사용자 조회
        optionalUser.ifPresent(user -> {
            Long kakaoId = user.getKakaoId();  // 해당 사용자의 kakaoId
            userRepository.delete(user);  // 해당 사용자 삭제
            System.out.println("User with userId " + userId + " and kakaoId " + kakaoId + " has been deleted.");
        });
    }
}
