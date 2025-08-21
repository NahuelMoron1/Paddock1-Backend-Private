"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const connection_1 = __importDefault(require("../../db/connection"));
const sequelize_1 = require("sequelize");
const Availability = connection_1.default.define("Availability", {
    id: {
        type: sequelize_1.DataTypes.STRING,
        primaryKey: true,
        defaultValue: sequelize_1.DataTypes.UUIDV4, // Genera UUID automáticamente
    },
    attendantID: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    dayOfWeek: {
        type: sequelize_1.DataTypes.ENUM("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"),
        allowNull: false,
    },
    startTime: {
        type: sequelize_1.DataTypes.TIME,
        allowNull: false,
    },
    endTime: {
        type: sequelize_1.DataTypes.TIME,
        allowNull: false,
    },
}, {
    timestamps: false,
    freezeTableName: true, // <--- esto evita que Sequelize pluralice el nombre
});
exports.default = Availability;
