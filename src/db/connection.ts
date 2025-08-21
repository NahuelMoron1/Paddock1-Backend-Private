import { Sequelize } from "sequelize";
import { DB_HOST } from "../models/config";
import { DB_NAME } from "../models/config";
import { DB_PASSWORD } from "../models/config";
import { DB_PORT } from "../models/config";
import { DB_USER } from "../models/config";
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: "mysql",
  timezone: "-03:00",
  dialectOptions: {
    timezone: "Etc/GMT+3", // para el lado del servidor MySQL
    dateStrings: true,
    typeCast: true,
  },
});
export default sequelize;
