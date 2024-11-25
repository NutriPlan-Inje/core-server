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
    
    askQuestion = async (previousMessage : string | null, question : string) : Promise<string>  => {
        try{
            const fineTuningContent : string = previousMessage
            ? `Your name is the Health and Nutrition Information Chatbot. Now, it’s time to deliver the current conversation content. A question, '${question}', has been sent. Please understand and provide an answer. If you know the person’s name, kindly use a polite expression such as, ', I can provide information about ~.' Please include as many details as possible and provide a specific answer. When you finish your response, please add a thank-you note. Previous message information: ${previousMessage}. You can refer to this information, but if you prefer, it’s okay to ignore it. (In this context, I am the one asking the question, and you are the one answering.) However, it may contain relevant information.,Please answer korean`
            : `Your name is the Health and Nutrition Information Chatbot. Now, it’s time to deliver the current conversation content. A question, '${question}', has been sent. Please understand and provide an answer.  kindly use polite expressions such as, 'I can provide information about ~.' Please provide a detailed and specific response. When you finish your answer, please add a thank-you note. Please answer korean`;

            console.log(fineTuningContent);
            const completion = await this.openai.chat.completions.create({
                model : "gpt-3.5-turbo",
                messages : [{ role : "user", content : fineTuningContent}],
            });
            
            const answer = completion.choices[0].message.content as string || "응답을 생성하지 못 했습니다";
            console.log("응답 :", answer);

            return answer;
        } catch (error) {
            console.error("openAI API 호출 중 오류 발생", error);
            return "openAI API 호출 중 오류 발생";
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

    //TODO: 방 생성시 
    createChatRoom = async ({ cr_id, u_id, title, date, dietPlan } : { cr_id : string, u_id : number, title : string, date : string, dietPlan :any}) => {
        try{  
            console.log(dietPlan)
            this.chatRepository.createChatRoom({ cr_id, title });
        } catch (error) {
            console.error("create chatRoom Error : ", error);
            throw error;
        }
    }
}