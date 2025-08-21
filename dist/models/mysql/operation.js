"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const connection_1 = __importDefault(require("../../db/connection"));
const sequelize_1 = require("sequelize");
const Operation = connection_1.default.define('Operation', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    fuelAmount: {
        type: sequelize_1.DataTypes.NUMBER
    },
    fuelPrice: {
        type: sequelize_1.DataTypes.FLOAT
    },
    actualDate: {
        type: sequelize_1.DataTypes.DATE
    },
    type: {
        type: sequelize_1.DataTypes.STRING
    },
    totalPrice: {
        type: sequelize_1.DataTypes.FLOAT
    },
    profit: {
        type: sequelize_1.DataTypes.FLOAT
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE
    }
});
exports.default = Operation;
