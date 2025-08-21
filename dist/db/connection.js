"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const config_1 = require("../models/config");
const config_2 = require("../models/config");
const config_3 = require("../models/config");
const config_4 = require("../models/config");
const config_5 = require("../models/config");
const sequelize = new sequelize_1.Sequelize(config_2.DB_NAME, config_5.DB_USER, config_3.DB_PASSWORD, {
    host: config_1.DB_HOST,
    port: config_4.DB_PORT,
    dialect: "mysql",
    timezone: "-03:00",
    dialectOptions: {
        timezone: "Etc/GMT+3", // para el lado del servidor MySQL
        dateStrings: true,
        typeCast: true,
    },
});
exports.default = sequelize;
