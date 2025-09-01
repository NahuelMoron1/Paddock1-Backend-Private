import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT;

export const DB_HOST = process.env.DB_HOST;
export const DB_USER = process.env.DB_USER as string;
export const DB_PASSWORD = process.env.DB_PASSWORD as string;
export const DB_NAME = process.env.DB_NAME as string;
export const SECRET_JWT_KEY = process.env.SECRET_JWT_KEY as string;
export const DOMAIN = process.env.DOMAIN as string;
export const SLACK = process.env.SLACK as string;
export const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL as string;
export const PRODUCTION = process.env.production === "true";
export const DB_PORT: number = parseInt(process.env.DB_PORT || "0");
export const MAINTENANCE: boolean = process.env.MAINTENANCE === "true";
