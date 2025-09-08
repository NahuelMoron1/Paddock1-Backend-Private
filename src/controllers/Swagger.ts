import swaggerJsdoc from "swagger-jsdoc";
import { URL } from "../models/config";

// Opciones de configuración de Swagger
const options = {
  definition: {
    openapi: "3.0.0", // versión OpenAPI
    info: {
      title: "Safe365 API",
      version: "1.0.0",
      description: "API Documentation for Safe365 Backend",
    },
    servers: [
      {
        url: URL, // Cambiá por tu dominio o puerto
      },
    ],
  },
  apis: ["./src/swagger/*.ts"], // Archivos donde tenés definidas tus rutas con comentarios JSDoc
};

export const specs = swaggerJsdoc(options);
