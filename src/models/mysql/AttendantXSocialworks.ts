import db from "../../db/connection";
import { DataTypes } from "sequelize";

const AttendantXSocialworks = db.define(
  "AttendantXSocialworks",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    attendantID: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    socialworkID: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { timestamps: false }
);

export default AttendantXSocialworks;
