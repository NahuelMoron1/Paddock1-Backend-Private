"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const connection_1 = __importDefault(require("../../db/connection"));
const sequelize_1 = require("sequelize");
const Payment = connection_1.default.define('Payment', {
    type: {
        type: sequelize_1.DataTypes.STRING
    },
    amount: {
        type: sequelize_1.DataTypes.FLOAT
    },
    reason: {
        type: sequelize_1.DataTypes.STRING
    },
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    currentDate: {
        type: sequelize_1.DataTypes.DATE
    }
});
exports.default = Payment;
