import { Service, Inject } from "typedi";
import mysql from 'mysql2/promise';
import Repository from "./index.repository";
import MessageDTO from "../dto/request/chat";

@Service()
export default class ChatRepository extends Repository {
    constructor(@Inject("pool") pool: mysql.Pool) {
        super(pool);
    }

    async saveMessages(messages: MessageDTO[]) {
        try {
            const query = `
                INSERT INTO message (cr_id, createAt, content, sender_name)
                VALUES ?`;

            // MessageDTO[]를 (string | number)[][] 형식으로 변환
            const values = messages.map(({ cr_id, createAt, content, sender_name }) => [
                cr_id,
                new Date(createAt * 1000).toISOString().slice(0, 19).replace('T', ' '),
                content,
                sender_name,
            ]);
            console.log(values[0]);

            await this.executeQuery(query, [values]); // 2차원 배열로 변환하여 전달
            console.log("Messages saved to DB");
        } catch (error) {
            console.error("saveMessages Repository Error :", error);
            throw error;
        }
    }

    async createChatRoom({ title, cr_id } : { title : string, cr_id : string}) {
        const query = `
            INSERT INTO chatRoom (id, title)
            VALUES (?,?)
        `;
        this.executeQuery(query, [cr_id, title]);
    }
}
