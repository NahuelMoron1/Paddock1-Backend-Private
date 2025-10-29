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
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
    },
    team: {
      type: DataTypes.STRING,
    },
    sqlTable: {
      type: DataTypes.STRING,
    },
    type: {
      //this refers to if it's driver/team/track
      type: DataTypes.STRING,
    },
  },
  {
    timestamps: false,
  }
);

export default Best_tens;
