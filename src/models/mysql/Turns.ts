import db from "../../db/connection";
import { DataTypes } from "sequelize";

const Turns = db.define(
  "Turns",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4, // Genera UUID automáticamente
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    place: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userID: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    attendantID: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("scheduled", "completed", "canceled"),
      allowNull: false,
      defaultValue: "scheduled",
    },
    comments: {
      type: DataTypes.STRING,
    },
  },
  { timestamps: false }
);

export default Turns;
