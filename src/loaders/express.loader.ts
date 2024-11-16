// src/loaders/express.loader.ts
import { Application, json, urlencoded } from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

export default async function expressLoader({ app }: { app: Application }) {
    app.use(cors((req, callback) => {
        console.log(`CORS enabled for: ${req.method} ${req.url}`);
        callback(null, { origin: true });
    }));

    app.use(json());
    app.use(urlencoded({ extended: false }));

    // Swagger 및 라우터 설정

    // 기본 경로
    app.get("/", (req, res) => {
        res.send("<h1>Hello</h1>");
    });

    console.log("Express loaded successfully!");
}
