"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const connection_1 = __importDefault(require("../../db/connection"));
const sequelize_1 = require("sequelize");
const CartProduct = connection_1.default.define('CartProducts', {
    id: {
        type: sequelize_1.DataTypes.STRING,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
    },
    price: {
        type: sequelize_1.DataTypes.FLOAT
    },
    quantity: {
        type: sequelize_1.DataTypes.INTEGER
    },
    optionSelected: {
        type: sequelize_1.DataTypes.STRING
    },
    orderID: {
        type: sequelize_1.DataTypes.STRING
    }
}, { timestamps: false });
exports.default = CartProduct;
