"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderXproducts = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../../db/connection"));
const OrderXproducts = connection_1.default.define('OrderXproducts', {
    id: {
        type: sequelize_1.DataTypes.STRING,
        primaryKey: true,
    },
    orderId: {
        type: sequelize_1.DataTypes.STRING,
    },
    productId: {
        type: sequelize_1.DataTypes.STRING,
    },
    quantity: {
        type: sequelize_1.DataTypes.INTEGER,
    }
}, { timestamps: false });
exports.OrderXproducts = OrderXproducts;
