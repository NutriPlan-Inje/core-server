import http from "http";
import { v4 as uuidv4 } from "uuid";
import { Server, Socket } from "socket.io";
import Container from "typedi";
import ChatService from "../services/chat.service";
import { Redis } from "ioredis";

export default function init(server: http.Server) {
    const io = new Server(server, {
        path: "/bot",
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            credentials: true,
        },
    });
    const chatService: ChatService = Container.get(ChatService);
    const redis: Redis = Container.get("redis");

    io.on("connection", async (socket: Socket) => {
        console.log("user connected");

        socket.on("create room", async ({ title }) => {
            const cr_id: string = uuidv4();
            console.log("방제목:", title);

            await redis.set(`room:${cr_id}`, JSON.stringify({ title, createdAt: Date.now() }));
            chatService.createChatRoom({ cr_id, title });

            socket.emit("room created", { cr_id, title });
            console.log(`Room ${cr_id} created with title: ${title}`);
        });

        socket.on("join room", async ({ cr_id }) => {
            try {
                const roomExists = await redis.exists(`room:${cr_id}`);
                if (!roomExists) {
                    return socket.emit("error", { message: `Room ${cr_id} does not exist` });
                }

                const roomData = await redis.get(`room:${cr_id}`);
                const { title } = JSON.parse(roomData || '{}');

                await redis.sadd(`room:${cr_id}:members`, socket.id);
                socket.join(`room-${cr_id}`);
                socket.emit("room joined", { cr_id, title });
                console.log(`Client ${socket.id} joined room ${cr_id} with title: ${title}`);
            } catch (error) {
                console.error("Error joining room:", error);
                socket.emit("error", { msg: "Failed to join room" });
            }
        });

        socket.on("chat message", async ({ roomId, msg }) => {
            try {
                const timestamp = Date.now();
                const messageData = JSON.stringify({ timestamp, msg, senderName: socket.id });

                await redis.rpush(`room:${roomId}:messages`, messageData);
                await redis.expire(`room:${roomId}:messages`, 3600);

                console.log(`Message received in room ${roomId}: ${msg}`);

                const answer = await chatService.askQuestion(null, msg);
                io.to(`room-${roomId}`).emit("chat message", { roomId, answer });
                console.log(`AI responded in room ${roomId}: ${answer}`);
            } catch (error) {
                console.error("Failed to send AI response", error);
                io.to(`room-${roomId}`).emit("chat message", { err: "failed to send message" });
            }
        });

        socket.on("disconnect", async () => {
            const roomKeys = await redis.keys("room:*:members");
            for (const key of roomKeys) {
                await redis.srem(key, socket.id);
            }
            console.log(`User ${socket.id} disconnected`);
        });
    });
}