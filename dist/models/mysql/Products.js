"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const connection_1 = __importDefault(require("../../db/connection"));
const sequelize_1 = require("sequelize");
const Products = connection_1.default.define("Products", {
    id: {
        type: sequelize_1.DataTypes.STRING,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
    },
    category: {
        type: sequelize_1.DataTypes.STRING,
    },
    brand: {
        type: sequelize_1.DataTypes.STRING,
    },
    price: {
        type: sequelize_1.DataTypes.FLOAT,
    },
    image: {
        type: sequelize_1.DataTypes.STRING,
    },
    subcategory: {
        type: sequelize_1.DataTypes.STRING,
    },
    quantity: {
        type: sequelize_1.DataTypes.INTEGER,
    },
    description: {
        type: sequelize_1.DataTypes.STRING,
    },
    discount: {
        type: sequelize_1.DataTypes.FLOAT,
    },
    priceDiscount: {
        type: sequelize_1.DataTypes.FLOAT,
    },
    optionSelected: {
        type: sequelize_1.DataTypes.STRING,
    },
    latestID: {
        type: sequelize_1.DataTypes.STRING,
    },
    sells: {
        type: sequelize_1.DataTypes.INTEGER,
    },
    secondOption: {
        type: sequelize_1.DataTypes.STRING,
    },
    color: {
        type: sequelize_1.DataTypes.STRING,
    },
}, { timestamps: false });
exports.default = Products;
