import { DataTypes } from "sequelize";
import db from "../../db/connection";

const TrueOrFalse = db.define(
  "TrueOrFalse",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4, // Genera UUID automáticamente
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY, // Usar DATEONLY en lugar de DATE para evitar problemas de zona horaria
      allowNull: false,
    },
  },
  {
    timestamps: false,
  },
);

export default TrueOrFalse;
