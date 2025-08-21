"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const connection_1 = __importDefault(require("../../db/connection"));
const sequelize_1 = require("sequelize");
const PriceXproducts = connection_1.default.define('PriceXproducts', {
    id: {
        type: sequelize_1.DataTypes.STRING,
        primaryKey: true,
    },
    optionID: {
        type: sequelize_1.DataTypes.STRING,
    },
    priceList1: {
        type: sequelize_1.DataTypes.FLOAT
    },
    priceList2: {
        type: sequelize_1.DataTypes.FLOAT
    },
    priceList3: {
        type: sequelize_1.DataTypes.FLOAT
    },
    priceList4: {
        type: sequelize_1.DataTypes.FLOAT
    },
    priceListE: {
        type: sequelize_1.DataTypes.FLOAT
    },
    priceListG: {
        type: sequelize_1.DataTypes.FLOAT
    },
    costPrice: {
        type: sequelize_1.DataTypes.FLOAT
    }
}, { timestamps: false });
exports.default = PriceXproducts;
