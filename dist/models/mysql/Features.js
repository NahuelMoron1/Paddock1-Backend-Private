"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const connection_1 = __importDefault(require("../../db/connection"));
const sequelize_1 = require("sequelize");
const Features = connection_1.default.define('Features', {
    id: {
        type: sequelize_1.DataTypes.STRING,
        primaryKey: true,
    },
    product_id: {
        type: sequelize_1.DataTypes.STRING,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
    },
    value: {
        type: sequelize_1.DataTypes.STRING
    }
}, { timestamps: false });
exports.default = Features;
