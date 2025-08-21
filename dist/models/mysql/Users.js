"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const connection_1 = __importDefault(require("../../db/connection"));
const sequelize_1 = require("sequelize");
const Users = connection_1.default.define("Users", {
    id: {
        type: sequelize_1.DataTypes.STRING,
        primaryKey: true,
        defaultValue: sequelize_1.DataTypes.UUIDV4, // Genera UUID automáticamente
    },
    fullName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    phone: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    userID: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: sequelize_1.DataTypes.ENUM("client", "attendant", "admin"),
        allowNull: false,
        defaultValue: "client",
    },
    directions: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM("active", "inactive"),
        allowNull: false,
        defaultValue: "active",
    },
    speciality: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    profileImage: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    /*socialWorkID: {
      type: DataTypes.STRING,
      allowNull: true,
    },*/
}, {
    timestamps: false,
    defaultScope: {
        attributes: { exclude: ["password", "userID", "email"] }, // Excluir 'password' por defecto
    },
    scopes: {
        withAll: {
            attributes: { include: ["password", "userID", "email"] }, // Incluir 'password' solo cuando se use este scope
        },
    },
});
exports.default = Users;
