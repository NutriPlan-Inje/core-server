import { Redis } from "ioredis";
import { Pool } from "mysql2/promise";
import OpenAI from "openai";
import{ Service, Inject } from "typedi";
import MessageDTO from "../dto/request/chat";
import ChatRepository from "../repositorys/chat.repository";

@Service()
export default class ChatService {
    constructor(
        private readonly chatRepository : ChatRepository,
        @Inject("openai") private readonly openai : OpenAI, 
        @Inject("pool") private readonly pool : Pool,
        @Inject("redis") private readonly redis : Redis,
    ){
        // 10분 간격으로 메시지를 저장을 한다.
        //TODO: test하며 시간 조절
        setInterval(() => this.saveMessageToDB(), 1000 * 60 * 10) // 600000 m/s = 10분
    }
    
    askQuestion = async (
        previousMessage: string | null,
        dietPlan: any,
        userMacronutrientRatioEvaluate: any,
        foodInfo: any,
        question: string
    ): Promise<string> => {
        try {
            // 객체 데이터를 JSON 문자열로 변환
            const dietPlanString = JSON.stringify(dietPlan, null, 2); // 보기 좋게 들여쓰기 추가
            const userMacronutrientRatioEvaluateString = JSON.stringify(userMacronutrientRatioEvaluate, null, 2);
            const foodInfoString = JSON.stringify(foodInfo, null, 2);
    
            // Fine-Tuning Content 생성
            const fineTuningContent = `
            너는 사용자의 질문에 대답을 해주는 챗봇이야.
            너의 이름은 NutriPlan 챗봇이야. 
            너는 너의 역할은 영양사이자 건강관리사야
            만약에 질문이 건강, 운동(헬스), 식단, 다이어트, 음식, 인체와 관련이 없는 것을 묻는다면 관련된 것을 물어달라고 요청을 하는 답변을 해.
            대화체는 공손하게 
            답변은 항상 한국어로 해,

            현재 메세지: ${question},
            이전 메세지: ${previousMessage || "없음"},
            오늘 먹은 식단 정보: ${dietPlanString || "없음"},
            오늘 먹은 식단 평가: ${userMacronutrientRatioEvaluateString || "없음"},
            오늘 먹은 음식들 영양정보: ${foodInfoString || "없음"},

            만약 이전 메세지가 존재한다면 
            인사는 안 해도 되고 바로 대답하면 되고
            이전 대화와는 다른 대답으로 새로운 답변을 해야 하고
            식단 추천은 음식으로만 추천해야 하고
            이전 대화에서 추천해준 음식이 있다면 그것과는 다른 음식으로 추천해줘

            튜닝 : 
            만약에 이전 메세지 정보가 없다면 이 사람은 오늘 처음 대화를 시작한 사람이야 정중하게 '안녕하세요. NutriPlan 챗봇입니다.'로 대화를 시작해
            사용자의 오늘 하루 동안 먹은 식단을 제공할 거야 
            만약에 식단 정보가 있다면 mealTime에 1,2,3은 순서대로 아침 점심 저녁이야
            만약에 식단 정보가 없다면 탄단지 비율 및 kcal를 권장섭취에 맞게 식단을 구성하면 돼
            오늘 먹은 식단 평가에서 
            macronutrientRecommendation  는 하루동안 권장되는 탄단지 영양소 그람(g)이야
            intakeMacronutrient 는 사용자가 하루동안 섭취한 탄단지 영양소 그람(g)이야
            evaluate 는 사용자가 현재까지 섭취한 탄단지에 대한 평가야
            만약에 사용자가 식단이나 먹을 음식을 추천해달라고 하면 제공해주는 정보를 바탕으로 영양소가 충분하면 지방과 탄수화물이 적은 음식으로 추천해주고 영양소가 부족하면 부족한 영양소를 채울 수 있는 음식으로 추천해
            음식을 추천해 줄 때는 사용자가 이미 섭취한 음식을 바탕으로 설명하면서 추천을 해줘야 해
            하루 섭취 탄수화물, 단백질, 지방이 균형 잡히게 음식을 추천해줘야 해
            `;
    
            console.log("🔥", fineTuningContent);
    
            // OpenAI API 호출
            const completion = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: fineTuningContent }],
            });
    
            const answer = completion.choices[0]?.message?.content || "응답을 생성하지 못 했습니다";
            console.log("응답:", answer);
    
            return answer;
        } catch (error) {
            console.error("openAI API 호출 중 오류 발생", error);
            return "openAI API 호출 중 오류 발생";
        }
    };

    createChatRoom = async ({ cr_id, u_id, title, date } : { cr_id : string, u_id : number, title : string, date : string}) => {
        try{  
            this.chatRepository.createChatRoom({ cr_id, title });
        } catch (error) {
            console.error("create chatRoom Error : ", error);
            throw error;
        }
    }

    saveMessageToDB = async() => {
        try {
            console.log("Starting saveMessageToDB...");
            const roomKeys = await this.redis.keys("room:*:messages");
            const allMessages: MessageDTO[] = [];
            console.log(roomKeys);
            for (const key of roomKeys) {
                const roomId = key.split(":")[1];
                const messages = await this.redis.lrange(key, 0, -1);
    
                const messageData = messages.map((msg) => {
                    const { timestamp, msg: content, senderName, u_id } = JSON.parse(msg);
                    return {
                        cr_id: roomId,
                        createAt: Math.floor(timestamp / 1000), // 초 단위로 변환
                        content,
                        sender_name: senderName,
                        u_id
                    } as MessageDTO;
                });
    
                allMessages.push(...messageData);
                await this.redis.del(key);
            }
    
            if (allMessages.length > 0) {
                console.log("Messages found, saving to DB...");
                await this.chatRepository.saveMessages(allMessages); // MessageDTO[] 형식으로 전달
            }
        } catch (error) {
            console.error("Error in saveMessageToDB:", error);
        }
    }

    //TODO socket 에서 create room 할 때 이전 메세지 가져오기 (redis, db확인)
    getMessages = async () => {
        try {

        } catch(error) {

        }
    }
}

`
너는 사용자의 질문에 대답을 해주는 챗봇이야.
너의 이름은 NutriPlan 챗봇이야. 
너는 너의 역할은 영양사이자 건강관리사야
만약에 질문이 건강, 운동(헬스), 식단, 다이어트, 음식, 인체와 관련이 없는 것을 묻는다면 관련된 것을 물어달라고 요청을 하는 답변을 해.
대화체는 공손하게 하고, 상세한 정보를 전달해주기 바래.
답변은 항상 한국어로 해

만약에 이전 메세지가 정보가 있다면 이전 메세지 정보를 학습하고 대화를 이어가면 되고, 
만약에 이전 메세지 정보가 없다면 이 사람은 오늘 처음 대화를 시작한 사람이야 정중하게 '안녕하세요. NutriPlan 챗봇입니다.'로 대화를 시작해
사용자의 오늘 하루 동안 먹은 식단을 제공할 거야 
만약에 식단 정보가 있다면 mealTime에 1,2,3은 순서대로 아침 점심 저녁이야
만약에 식단 정보가 없다면 탄단지 비율 및 kcal를 권장섭취에 맞게 식단을 구성하면 돼
오늘 먹은 식단 평가에서 
macronutrientRecommendation  는 하루동안 권장되는 탄단지 영양소 그람(g)이야
intakeMacronutrient 는 사용자가 하루동안 섭취한 탄단지 영양소 그람(g)이야
evaluate 는 사용자가 현재까지 섭취한 탄단지에 대한 평가야
만약에 사용자가 식단이나 먹을 음식을 추천해달라고 하면 제공해주는 정보를 바탕으로 영양소가 충분하면 지방과 탄수화물이 적은 음식으로 추천해주고 영양소가 부족하면 부족한 영양소를 채울 수 있는 음식으로 추천해

`