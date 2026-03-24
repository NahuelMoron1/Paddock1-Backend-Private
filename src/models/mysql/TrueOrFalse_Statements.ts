import { DataTypes } from "sequelize";
import db from "../../db/connection";

const TrueOrFalse_Statements = db.define(
  "TrueOrFalse_Statements",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4, // Genera UUID automáticamente
    },
    gameID: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    statement: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    answer: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    trueDescription: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    falseDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    driverId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  },
);

export default TrueOrFalse_Statements;
