import { DataTypes } from "sequelize";
import db from "../../db/connection";

const Impostors = db.define(
  "Impostors",
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
    amount_impostors: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount_innocents: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("driver", "team", "track"),
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

export default Impostors;
