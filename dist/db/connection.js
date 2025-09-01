"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const config_1 = require("../models/config");
const sequelize = new sequelize_1.Sequelize(config_1.DB_NAME, config_1.DB_USER, config_1.DB_PASSWORD, {
    host: config_1.DB_HOST,
    port: config_1.DB_PORT,
    dialect: "mysql",
    timezone: "America/Argentina/Buenos_Aires",
    dialectOptions: {
        timezone: "Etc/GMT+3", // para el lado del servidor MySQL
        dateStrings: true,
        typeCast: true,
    },
});
exports.default = sequelize;
