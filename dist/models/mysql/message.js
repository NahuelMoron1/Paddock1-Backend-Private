"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const connection_1 = __importDefault(require("../../db/connection"));
const sequelize_1 = require("sequelize");
const Message = connection_1.default.define('Message', {
    message: {
        type: sequelize_1.DataTypes.STRING,
    },
    currentDate: {
        type: sequelize_1.DataTypes.DATE
    },
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }
});
exports.default = Message;
