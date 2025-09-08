"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.specs = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const config_1 = require("../models/config");
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
                url: config_1.URL, // Cambiá por tu dominio o puerto
            },
        ],
    },
    apis: ["./src/swagger/*.ts"], // Archivos donde tenés definidas tus rutas con comentarios JSDoc
};
exports.specs = (0, swagger_jsdoc_1.default)(options);
