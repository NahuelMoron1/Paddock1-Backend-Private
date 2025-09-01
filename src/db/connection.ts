import { Sequelize } from "sequelize";
import {
  DB_HOST,
  DB_NAME,
  DB_PASSWORD,
  DB_PORT,
  DB_USER,
} from "../models/config";
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: "mysql",
  timezone: "America/Argentina/Buenos_Aires",
  dialectOptions: {
    timezone: "Etc/GMT+3", // para el lado del servidor MySQL
    dateStrings: true,
    typeCast: true,
  },
});
export default sequelize;
