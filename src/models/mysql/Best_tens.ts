import { DataTypes } from "sequelize";
import db from "../../db/connection";

const Best_tens = db.define(
  "Best_tens",
  {
    id: {
      type: DataTypes.CHAR,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    year: {
      type: DataTypes.NUMBER,
    },
    fromYear: {
      type: DataTypes.NUMBER,
    },
    toYear: {
      type: DataTypes.NUMBER,
    },
    nationality: {
      type: DataTypes.STRING,
    },
    table: {
      type: DataTypes.STRING,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    team: {
      type: DataTypes.STRING,
    },
    sqlTable: {
      type: DataTypes.STRING,
    },
    type: {
      type: DataTypes.ENUM("driver", "team", "track"),
      allowNull: false,
    },
    creation: {
      type: DataTypes.ENUM("manual", "automatic"),
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

export default Best_tens;
