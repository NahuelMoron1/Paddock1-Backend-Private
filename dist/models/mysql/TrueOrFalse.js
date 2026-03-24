"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../../db/connection"));
const TrueOrFalse = connection_1.default.define("TrueOrFalse", {
    id: {
        type: sequelize_1.DataTypes.STRING,
        primaryKey: true,
        defaultValue: sequelize_1.DataTypes.UUIDV4, // Genera UUID automáticamente
    },
    title: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    date: {
        type: sequelize_1.DataTypes.DATEONLY, // Usar DATEONLY en lugar de DATE para evitar problemas de zona horaria
        allowNull: false,
    },
}, {
    timestamps: false,
});
exports.default = TrueOrFalse;
