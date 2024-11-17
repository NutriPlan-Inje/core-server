import swaggerAutogen from "swagger-autogen"

const doc = {
  info: {
    title: "NutriPlan Express API",
    description: "Description",
  },
  host: "localhost:8080/node",
  schemes: ["http"],
  "x-cors": {
    enabled: true,
    description:
      "Cross-Origin Resource Sharing (CORS) is supported for this API.",
  },
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./apis/index.ts"];

swaggerAutogen(outputFile, endpointsFiles, doc);