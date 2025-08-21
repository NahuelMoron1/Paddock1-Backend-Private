import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT;

///LOCAL///
export const DB_HOST = process.env.DB_HOST;
export const DB_USER = process.env.DB_USER || "";
export const DB_PASSWORD = process.env.DB_PASSWORD || "";
export const DB_NAME = process.env.DB_NAME || "";
export const SECRET_JWT_KEY = process.env.SECRET_JWT_KEY as string;
export const DB_PORT: number = parseInt(process.env.DB_PORT || "0");
export const MAINTENANCE: boolean = process.env.MAINTENANCE === "true";

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
