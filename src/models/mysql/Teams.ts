import { DataTypes } from "sequelize";
import db from "../../db/connection";

const Teams = db.define(
  "Teams",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4, // Genera UUID automáticamente
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    common_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    championships: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    base: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    popularity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

export default Teams;
