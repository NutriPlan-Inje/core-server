package NutriPlan.Service;

import NutriPlan.Repository.FoodInfoRepository;
import NutriPlan.Repository.UserDietPlanRepository;
import NutriPlan.Repository.UserRepository;
import NutriPlan.model.Dao.FoodInfo;
import NutriPlan.model.Dao.User;
import NutriPlan.model.Dao.UserDietPlan;
import NutriPlan.model.Dto.FoodNutrientDto;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;


import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.ByteArrayInputStream;
import java.io.StringReader;
import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static java.lang.Integer.parseInt;


@Service
public class FoodService {


    private FoodInfoRepository foodInfoRepository;

    @Autowired
    private UserDietPlanRepository userDietPlanRepository;

    @Autowired
    private UserRepository userRepository;

    @Value("${api.url}")
    private String apiUrl;

    @Value("${api.key}")
    private String apiKey;

    @Autowired
    public FoodService(FoodInfoRepository foodInfoRepository) {
        this.foodInfoRepository = foodInfoRepository;
    }
    public List<FoodNutrientDto> searchFood(String foodName) throws Exception {
        RestTemplate restTemplate = new RestTemplate();

        String encodedFoodName = URLEncoder.encode(foodName, StandardCharsets.UTF_8);

        String url = UriComponentsBuilder.fromHttpUrl(apiUrl)
                //.queryParam("serviceKey", URLEncoder.encode(apiKey, StandardCharsets.UTF_8))
                .queryParam("serviceKey",apiKey)
                .queryParam("FOOD_NM_KR", encodedFoodName)
                .queryParam("pageNo",1)
                .queryParam("numOfRows",20)
                .queryParam("type", "xml")
                .build(false)
                .toUriString();
        URI uri = new URI(url);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.add("Accept", "application/xml");
            headers.add("Content-Type", "application/xml; charset=UTF-8");


            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<byte[]> responseEntity = restTemplate.exchange(uri, HttpMethod.GET, entity, byte[].class);
            String response = new String(responseEntity.getBody(), StandardCharsets.UTF_8);


            if (response == null || response.isEmpty()) {
                throw new RuntimeException("API 응답이 비어있습니다.");
            }

            return parseXmlResponse(response);

        } catch (Exception e) {
            System.err.println("API 호출 오류: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("음식 정보를 불러오는 중 오류가 발생했습니다. 상세 메시지: " + e.getMessage());
        }
    }

    private List<FoodNutrientDto> parseXmlResponse(String response) throws Exception {
        List<FoodNutrientDto> foodList = new ArrayList<>();

        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        DocumentBuilder builder = factory.newDocumentBuilder();
//        Document document = builder.parse(response);

        InputSource inputSource = new InputSource(new StringReader(response));
        inputSource.setEncoding("UTF-8");
        Document document = builder.parse(inputSource);

        NodeList nodeList = document.getElementsByTagName("item");

        for (int i = 0; i < nodeList.getLength(); i++) {
            Node node = nodeList.item(i);

            FoodNutrientDto dto = new FoodNutrientDto();

            NodeList childNodes = node.getChildNodes();
            for (int j = 0; j < childNodes.getLength(); j++) {
                Node childNode = childNodes.item(j);

                if ("FOOD_NM_KR".equals(childNode.getNodeName())) {
                    dto.setFoodName(childNode.getTextContent());
                } else if("SERVING_SIZE".equals(childNode.getNodeName())){
                    dto.setServingSize(parseInt(childNode.getTextContent()));
                } else if ("AMT_NUM1".equals(childNode.getNodeName())) {
                    dto.setKcal(parseDouble(childNode.getTextContent()));
                } else if("AMT_NUM7".equals(childNode.getNodeName()))  {
                    dto.setCarbohydrate(parseDouble(childNode.getTextContent()));
                } else if ("AMT_NUM3".equals(childNode.getNodeName())) {
                    dto.setProtein(parseDouble(childNode.getTextContent()));
                } else if ("AMT_NUM4".equals(childNode.getNodeName())) {
                    dto.setFat(parseDouble(childNode.getTextContent()));
                }
            }

            foodList.add(dto);
        }

        return foodList;
    }
    @Transactional
    public void saveFoodForUser(int userId, FoodNutrientDto foodDto,int mealTime) {


        if (userId == 0) {
            throw new RuntimeException("User ID cannot be null");
        }

        Optional<User> userOptional = userRepository.findById(userId);

        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found with ID: " + userId);
        }

        User user = userOptional.get();
        System.out.println("User found: " + user.getNick());

        Optional<FoodInfo> existingFood = foodInfoRepository.findByFoodName(foodDto.getFoodName());


        FoodInfo food;
        if (existingFood.isPresent()) {
            food = existingFood.get();
        } else {

            FoodInfo newFood = new FoodInfo();
            newFood.setFoodName(foodDto.getFoodName());
            newFood.setServingSize(foodDto.getServingSize());
            newFood.setKcal(foodDto.getKcal());
            newFood.setCarbohydrate(foodDto.getCarbohydrate());
            newFood.setProtein(foodDto.getProtein());
            newFood.setFat(foodDto.getFat());


            food = foodInfoRepository.save(newFood);
            System.out.println("Saved FoodInfo: " + food.getFoodName());
        }

        UserDietPlan dietPlan = new UserDietPlan(user, food, LocalDate.now(), mealTime);
        System.out.println("Created UserDietPlan: " + dietPlan);


        userDietPlanRepository.save(dietPlan);
        System.out.println("UserDietPlan saved: " + dietPlan);
    }

    private double parseDouble(String value) {
        try {
            return value.isEmpty() ? 0.0 : Double.parseDouble(value);
        } catch (NumberFormatException e) {
            return 0.0;
        }
    }

    private int parseInt(String value) {
        try {
            String numericValue = value.replaceAll("[^0-9]", "");
            return numericValue.isEmpty() ? 0 : Integer.parseInt(numericValue);
        } catch (NumberFormatException e) {
            System.err.println("Serving size 변환 오류: " + value);
            return 0;
        }
    }
}