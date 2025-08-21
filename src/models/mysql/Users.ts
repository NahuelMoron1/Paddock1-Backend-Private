import db from "../../db/connection";
import { DataTypes } from "sequelize";

const Users = db.define(
  "Users",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4, // Genera UUID automáticamente
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userID: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("client", "attendant", "admin"),
      allowNull: false,
      defaultValue: "client",
    },
    directions: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: false,
      defaultValue: "active",
    },
    speciality: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    profileImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    /*socialWorkID: {
      type: DataTypes.STRING,
      allowNull: true,
    },*/
  },
  {
    timestamps: false,
    defaultScope: {
      attributes: { exclude: ["password", "userID", "email"] }, // Excluir 'password' por defecto
    },
    scopes: {
      withAll: {
        attributes: { include: ["password", "userID", "email"] }, // Incluir 'password' solo cuando se use este scope
      },
    },
  }
);

export default Users;
