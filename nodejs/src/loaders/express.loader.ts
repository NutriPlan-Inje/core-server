// src/loaders/express.loader.ts
import { Application, json, urlencoded } from "express";
import router from "../api/index.api";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";

const swaggerDocument = require("../../swagger-output.json");
dotenv.config();

export default async function expressLoader({ app }: { app: Application }) {
    app.use(cors((req, callback) => {
        console.log(`CORS enabled for: ${req.method} ${req.url}`);
        callback(null, { origin: true });
    }));

    app.use(json());
    app.use(urlencoded({ extended: false }));

    // Swagger 및 라우터 설정
    app.use("/node/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    app.use("/node", router());

    // 기본 경로
    app.get("/", (req, res) => {
        res.send("<h1>Hello</h1>");
    });

    console.log("Express loaded successfully!");
}
