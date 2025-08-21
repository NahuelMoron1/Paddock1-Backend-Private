"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const connection_1 = __importDefault(require("../../db/connection"));
const sequelize_1 = require("sequelize");
const Turns = connection_1.default.define("Turns", {
    id: {
        type: sequelize_1.DataTypes.STRING,
        primaryKey: true,
        defaultValue: sequelize_1.DataTypes.UUIDV4, // Genera UUID automáticamente
    },
    date: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    place: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    userID: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    attendantID: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM("scheduled", "completed", "canceled"),
        allowNull: false,
        defaultValue: "scheduled",
    },
    comments: {
        type: sequelize_1.DataTypes.STRING,
    },
}, { timestamps: false });
exports.default = Turns;
