import http from "http";
import { v4 as uuidv4 } from "uuid";
import { Server, Socket } from "socket.io";
import Container from "typedi";
import ChatService from "../services/chat.service";
import { Redis } from "ioredis";
import axios from "axios";
import { DietPlanResponseDTO } from "../dto/response/dietPlan";

const formatDate = (): string => {
    const now = new Date(Date.now());
    
    const year = now.getFullYear(); 
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0'); 
    
    return `${year}-${month}-${day}`; // YYYY-MM-DD 형식으로 반환
};
const url : string = "http://3.38.175.70/node";

// 각 food_id에 대해 정보를 가져오는 함수
const getFoodInfoById = async (food_id: number): Promise<any> => {
    try {
        const response = await axios.get(`${url}/foodInfo/${food_id}`);
        return response.data; // 음식 정보를 반환
    } catch (error) {
        console.error(`❌ Error fetching food info for ID ${food_id}:`, error);
        return null; // 에러 발생 시 null 반환
    }
};

const getFoodInfos = async (dietPlan: DietPlanResponseDTO): Promise<any[]> => {
    // 응답 데이터 검증
    if (!dietPlan || !Array.isArray(dietPlan.data)) {
        throw new Error("Invalid dietPlan data format");
    }

    // food_id 배열 추출 및 중복 제거
    const uniqueFoodIds = [...new Set(dietPlan.data.map((item) => item.food_id))];

    try {
        // 각 food_id에 대해 비동기로 정보를 가져옴
        const foodInfoPromises = uniqueFoodIds.map((food_id) => getFoodInfoById(food_id));
        const foodInfos = await Promise.all(foodInfoPromises);

        // 유효한 정보만 반환
        return foodInfos.filter((info) => info !== null);
    } catch (error) {
        console.error("❌ Error fetching food information:", error);
        return [];
    }
};




export default function init(server: http.Server) {
    const io = new Server(server, {
        path: "/bot",
        cors: {
            origin: "*", // 모든 도메인 허용
            methods: ["GET", "POST"],
            credentials: true,
        }, 
    });
    const chatService: ChatService = Container.get(ChatService);
    const redis: Redis = Container.get("redis");

    
    io.on("connection", async (socket: Socket) => {
        console.log("✅ A user connected:", socket.id);

        // 방 생성 이벤트
        socket.on("create room", async (data: { u_id: number; date: string }) => {
            try {
                console.log(data);
                const cr_id: string = uuidv4();
                const u_id : number = data.u_id;
                const title : string = `${u_id}:${cr_id}`;
                const date : string = data.date;

                await redis.set(`room:${cr_id}`, JSON.stringify({createdAt: date }));
                //TODO 이전 메세지 불러오기
                chatService.createChatRoom({ cr_id, u_id, title, date});
                
                socket.emit("room created", { cr_id, title });
                console.log(`Room ${cr_id} created with title: ${title}`);
            } catch (error) {
                console.error("Error creating room:", error);
                socket.emit("error", { message: "Failed to create room" });
            }
        });

        // 방 참가 이벤트
        socket.on("join room", async ({ cr_id }) => {
            try {
                const roomData = await redis.get(`room:${cr_id}`);
                if (!roomData) {
                    socket.emit("error", { message: `Room ${cr_id} does not exist` });
                    return;
                }

                const { title } = JSON.parse(roomData);
                socket.join(`room-${cr_id}`);
                await redis.sadd(`room:${cr_id}:members`, socket.id);

                socket.emit("room joined", { cr_id, title });
                console.log(`✅ User ${socket.id} joined room ${cr_id}`);
            } catch (error) {
                console.error("❌ Error joining room:", error);
                socket.emit("error", { message: "Failed to join room" });
            }
        });

        socket.on("chat message", async ({ roomId, msg, u_id, date }) => {
            try {
                // 기본값 설정
                const queryDate = date || formatDate();
                
                console.log(`💬 Received message in room ${roomId}: ${msg}`);
                
                // dietPlan 데이터 가져오기
                const dietPlanResponse = await axios.get<DietPlanResponseDTO>(`${url}/dietPlan/${u_id}/${queryDate}`);
                const dietPlanData = dietPlanResponse.data; // Axios의 data 추출
        
                if (!dietPlanData || !Array.isArray(dietPlanData.data)) {
                    throw new Error("Invalid dietPlan API response format");
                }
        
                const dietPlan = dietPlanData.data;
        
                if (!dietPlan.length) {
                    console.warn(`⚠️ No diet plan found for user ${u_id} on ${queryDate}`);
                }
        
                // Macronutrient Ratio 평가 데이터 가져오기
                const macronutrientRatioResponse = await axios.get(`${url}/macronutrientRatio/evaluate/${u_id}/${queryDate}`);
                const userMacronutrientRatioEvaluate = macronutrientRatioResponse.data;
        
                // foodInfo 데이터 가져오기
                const foodInfo = await getFoodInfos(dietPlanData); // dietPlanData를 전달
        
                // Redis의 이전 메시지 가져오기
                const previousMessages = await redis.lrange(`room:${roomId}:messages`, 0, -1);
                const previousMessageContent = previousMessages
                    .map((m) => {
                        try {
                            const parsed = JSON.parse(m);
                            return `${parsed.type === "user" ? "사용자" : "챗봇"}: ${parsed.msg}`;
                        } catch (error) {
                            console.error("❌ Error parsing message from Redis:", m, error);
                            return null; // JSON 파싱 실패 시 무시
                        }
                    })
                    .filter((m) => m !== null) // 유효한 메시지만 유지
                    .join(" ");
        
                console.log(`dietPlan :`, dietPlan);
                console.log(`userMacronutrientRatioEvaluate :`, userMacronutrientRatioEvaluate);
                console.log(`foodInfo :`, foodInfo);
                console.log(`previousMessages :`, previousMessages);
        
                // AI 답변 생성
                const answer = await chatService.askQuestion(
                    previousMessageContent,
                    dietPlan,
                    userMacronutrientRatioEvaluate,
                    foodInfo,
                    msg
                );
        
                // 클라이언트로 응답 전송
                io.to(`room-${roomId}`).emit("chat message", { roomId, sender: "AI Bot", answer });
        
                const timestamp = Date.now();
        
                // 사용자 메시지 저장
                const userMessageData = JSON.stringify({
                    type: "user",
                    timestamp,
                    msg,
                    senderName: socket.id,
                    u_id
                });
                await redis.rpush(`room:${roomId}:messages`, userMessageData);
        
                // Redis에 챗봇 응답 저장
                const botMessageData = JSON.stringify({
                    type: "bot",
                    timestamp: Date.now(),
                    msg: answer,
                    senderName: "AI Bot",
                    u_id: null
                });
                await redis.rpush(`room:${roomId}:messages`, botMessageData);
        
                console.log("✅ 메시지가 Redis에 저장되었습니다.");
                console.log(`🤖 AI responded in room ${roomId}: ${answer}`);
            } catch (error) {
                console.error("❌ Error processing message:", error);
                socket.emit("error", { message: error });
            }
        });
        
        
        
        

        // 연결 종료 이벤트
        socket.on("disconnect", async () => {
            console.log(`❌ User disconnected: ${socket.id}`);
        });
    });
}
