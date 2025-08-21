"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const connection_1 = __importDefault(require("../../db/connection"));
const sequelize_1 = require("sequelize");
const UserXcoupon = connection_1.default.define('UserXcoupons', {
    id: {
        type: sequelize_1.DataTypes.STRING,
        primaryKey: true,
    },
    userID: {
        type: sequelize_1.DataTypes.STRING,
        unique: true,
    },
    couponID: {
        type: sequelize_1.DataTypes.STRING
    }
}, { timestamps: false });
exports.default = UserXcoupon;
