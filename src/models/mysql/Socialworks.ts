import db from "../../db/connection";
import { DataTypes } from "sequelize";

const Socialworks = db.define(
  "Socialworks",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    active: {
      type: DataTypes.BOOLEAN,
    },
  },
  { timestamps: false }
);

export default Socialworks;
