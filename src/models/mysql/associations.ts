// models/index.js
import Users from "./Users.js";
import Socialworks from "./Socialworks.js";
import AttendantXSocialworks from "./AttendantXSocialworks.js";
import Turns from "./Turns.js";
import Reviews from "./Reviews.js";

// Asociaciones
Users.hasMany(AttendantXSocialworks, { foreignKey: "attendantID" });
AttendantXSocialworks.belongsTo(Users, {
  foreignKey: "attendantID",
  targetKey: "id",
});

Socialworks.hasMany(AttendantXSocialworks, { foreignKey: "socialworkID" });
AttendantXSocialworks.belongsTo(Socialworks, {
  foreignKey: "socialworkID",
  targetKey: "id",
});

// Asociación directa entre Users y Socialworks (usuario tiene 1 obra social)
Users.belongsTo(Socialworks, {
  foreignKey: "socialworkID",
  targetKey: "id", // opcional si tu clave primaria es `id`
});
Socialworks.hasMany(Users, {
  foreignKey: "socialworkID",
});

// Un turno pertenece a un usuario (cliente)
Turns.belongsTo(Users, {
  foreignKey: "userID",
  as: "User", // ← alias obligatorio
});

// Un turno pertenece a un atendedor (médico)
Turns.belongsTo(Users, {
  foreignKey: "attendantID",
  as: "Attendant", // ← alias obligatorio
});

Users.hasMany(Turns, {
  foreignKey: "userID",
  as: "ClientTurns",
});

Users.hasMany(Turns, {
  foreignKey: "attendantID",
  as: "AttendedTurns",
});

// Una review pertenece a un usuario (cliente)
Reviews.belongsTo(Users, {
  foreignKey: "userID",
  as: "User", // ← alias obligatorio
});

Reviews.belongsTo(Users, { as: "Attendant", foreignKey: "attendantID" });

export { Users, Socialworks, AttendantXSocialworks };
