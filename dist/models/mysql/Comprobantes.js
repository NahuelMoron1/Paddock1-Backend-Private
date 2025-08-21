"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const connection_1 = __importDefault(require("../../db/connection"));
const sequelize_1 = require("sequelize");
const Comprobantes = connection_1.default.define('Comprobantes', {
    id: {
        type: sequelize_1.DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    orderID: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    userID: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    data: {
        type: sequelize_1.DataTypes.BLOB('long'),
        allowNull: false
    }
}, { timestamps: false });
exports.default = Comprobantes;
