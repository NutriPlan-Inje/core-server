import http from "http";
import { v4 as uuidv4 } from "uuid";
import { Server, Socket } from "socket.io";
import Container from "typedi";
import ChatService from "../services/chat.service";
import { Redis } from "ioredis";
import axios from "axios";

const formatDate = (): string => {
    const now = new Date(Date.now());
    
    const year = now.getFullYear(); 
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0'); 
    
    return `${year}-${month}-${day}`; // YYYY-MM-DD 형식으로 반환
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
        socket.on("create room", async (data) => {
            try {
                console.log(data);
                const cr_id: string = uuidv4();
                const u_id : number = data.u_id;
                const title : string = `${u_id}:${cr_id}`;
                const date : string = data.date;

                await redis.set(`room:${cr_id}`, JSON.stringify({createdAt: date }));

                const dietPlan = await axios.get(`http://3.38.175.70/node/${u_id}/${date}`);
                console.log(dietPlan);

                chatService.createChatRoom({ cr_id, u_id, title, date, dietPlan});
                
                


                socket.emit("room created", { cr_id, title,  });
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

        // 채팅 메시지 이벤트
        socket.on("chat message", async ({ roomId, msg, u_id }) => {
            try {
                // 메시지 Redis 저장
                const timestamp = Date.now();
                const messageData = JSON.stringify({ timestamp, msg, senderName: socket.id, u_id });
                await redis.rpush(`room:${roomId}:messages`, messageData); 

                console.log(`💬 Received message in room ${roomId}: ${msg}`);

                // AI 답변 생성
                const previousMessages = await redis.lrange(`room:${roomId}:messages`, 0, -1);
                const previousMessageContent = previousMessages
                    .map((m) => JSON.parse(m).msg)
                    .join(" ");

                const answer = await chatService.askQuestion(previousMessageContent, msg);

                // 클라이언트로 응답 전송
                io.to(`room-${roomId}`).emit("chat message", { roomId, sender: "AI Bot", answer });
                console.log(`🤖 AI responded in room ${roomId}: ${answer}`);
            } catch (error) {
                console.error("❌ Error processing message:", error);
                socket.emit("error", { message: "Failed to send message" });
            }
        });

        // 연결 종료 이벤트
        socket.on("disconnect", async () => {
            console.log(`❌ User disconnected: ${socket.id}`);
        });
    });
}
