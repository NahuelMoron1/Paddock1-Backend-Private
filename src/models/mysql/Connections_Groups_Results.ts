import { DataTypes } from "sequelize";
import db from "../../db/connection";

const Connections_Groups_Results = db.define(
  "Connections_Groups_Results",
  {
    id: {
      type: DataTypes.CHAR,
      primaryKey: true,
    },
    groupID: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    resultID: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

export default Connections_Groups_Results;
