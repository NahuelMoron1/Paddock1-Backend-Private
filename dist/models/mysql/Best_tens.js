"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../../db/connection"));
const Best_tens = connection_1.default.define("best_tens", {
    id: {
        type: sequelize_1.DataTypes.CHAR,
        primaryKey: true,
    },
    title: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    year: {
        type: sequelize_1.DataTypes.NUMBER,
    },
    fromYear: {
        type: sequelize_1.DataTypes.NUMBER,
    },
    toYear: {
        type: sequelize_1.DataTypes.NUMBER,
    },
    nationality: {
        type: sequelize_1.DataTypes.STRING,
    },
    table: {
        type: sequelize_1.DataTypes.STRING,
    },
    date: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
    },
    team: {
        type: sequelize_1.DataTypes.STRING,
    },
    sqlTable: {
        type: sequelize_1.DataTypes.STRING,
    },
    type: {
        type: sequelize_1.DataTypes.ENUM("driver", "team", "track"),
        allowNull: false,
    },
    creation: {
        type: sequelize_1.DataTypes.ENUM("manual", "automatic"),
        allowNull: false,
    },
}, {
    timestamps: false,
});
exports.default = Best_tens;
