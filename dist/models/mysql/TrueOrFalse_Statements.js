"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../../db/connection"));
const TrueOrFalse_Statements = connection_1.default.define("TrueOrFalse_Statements", {
    id: {
        type: sequelize_1.DataTypes.STRING,
        primaryKey: true,
        defaultValue: sequelize_1.DataTypes.UUIDV4, // Genera UUID automáticamente
    },
    gameID: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    statement: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    answer: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
    },
    trueDescription: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    falseDescription: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    driverId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    order: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    timestamps: false,
});
exports.default = TrueOrFalse_Statements;
