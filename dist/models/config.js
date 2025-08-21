"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAINTENANCE = exports.DB_PORT = exports.SECRET_JWT_KEY = exports.DB_NAME = exports.DB_PASSWORD = exports.DB_USER = exports.DB_HOST = exports.PORT = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.PORT = process.env.PORT;
///LOCAL///
exports.DB_HOST = process.env.DB_HOST;
exports.DB_USER = process.env.DB_USER;
exports.DB_PASSWORD = process.env.DB_PASSWORD;
exports.DB_NAME = process.env.DB_NAME;
exports.SECRET_JWT_KEY = process.env.SECRET_JWT_KEY;
exports.DB_PORT = process.env.DB_PORT;
exports.MAINTENANCE = process.env.MAINTENANCE === "true";
///PRODUCTION
/*export const DB_HOST = process.env.DB_HOST || "127.0.0.1";
export const DB_USER = process.env.DB_USER || "losvascosuser";
export const DB_PASSWORD = process.env.DB_PASSWORD || "Cacerola2611@";
export const DB_NAME = process.env.DB_NAME || "losvascos";
export const SECRET_JWT_KEY = "contrasena-larga-segura-con-hashes";
export let DB_PORT: number = 3306;
if (process.env.DB_PORT) {
  DB_PORT = parseInt(process.env.DB_PORT) || 3306;
}
export const MAINTENANCE = process.env.MAINTENANCE || false;*/
