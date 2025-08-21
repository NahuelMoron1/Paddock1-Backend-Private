"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const connection_1 = __importDefault(require("../../db/connection"));
const sequelize_1 = require("sequelize");
const Userdata = connection_1.default.define('Userdata', {
    id: {
        type: sequelize_1.DataTypes.STRING,
        primaryKey: true,
    },
    firstname: {
        type: sequelize_1.DataTypes.STRING,
    },
    lastname: {
        type: sequelize_1.DataTypes.STRING
    },
    company: {
        type: sequelize_1.DataTypes.STRING
    },
    phone: {
        type: sequelize_1.DataTypes.STRING
    },
    email: {
        type: sequelize_1.DataTypes.STRING
    },
    country: {
        type: sequelize_1.DataTypes.STRING
    },
    province: {
        type: sequelize_1.DataTypes.STRING
    },
    city: {
        type: sequelize_1.DataTypes.STRING
    },
    street: {
        type: sequelize_1.DataTypes.STRING
    },
    streetNumb: {
        type: sequelize_1.DataTypes.INTEGER
    },
    userID: {
        type: sequelize_1.DataTypes.STRING
    },
    saveIt: {
        type: sequelize_1.DataTypes.STRING
    }
}, { timestamps: false });
exports.default = Userdata;
