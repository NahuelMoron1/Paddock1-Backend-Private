"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendantXSocialworks = exports.Socialworks = exports.Users = void 0;
// models/index.js
const Users_js_1 = __importDefault(require("./Users.js"));
exports.Users = Users_js_1.default;
const Socialworks_js_1 = __importDefault(require("./Socialworks.js"));
exports.Socialworks = Socialworks_js_1.default;
const AttendantXSocialworks_js_1 = __importDefault(require("./AttendantXSocialworks.js"));
exports.AttendantXSocialworks = AttendantXSocialworks_js_1.default;
const Turns_js_1 = __importDefault(require("./Turns.js"));
const Reviews_js_1 = __importDefault(require("./Reviews.js"));
// Asociaciones
Users_js_1.default.hasMany(AttendantXSocialworks_js_1.default, { foreignKey: "attendantID" });
AttendantXSocialworks_js_1.default.belongsTo(Users_js_1.default, {
    foreignKey: "attendantID",
    targetKey: "id",
});
Socialworks_js_1.default.hasMany(AttendantXSocialworks_js_1.default, { foreignKey: "socialworkID" });
AttendantXSocialworks_js_1.default.belongsTo(Socialworks_js_1.default, {
    foreignKey: "socialworkID",
    targetKey: "id",
});
// Asociación directa entre Users y Socialworks (usuario tiene 1 obra social)
Users_js_1.default.belongsTo(Socialworks_js_1.default, {
    foreignKey: "socialworkID",
    targetKey: "id", // opcional si tu clave primaria es `id`
});
Socialworks_js_1.default.hasMany(Users_js_1.default, {
    foreignKey: "socialworkID",
});
// Un turno pertenece a un usuario (cliente)
Turns_js_1.default.belongsTo(Users_js_1.default, {
    foreignKey: "userID",
    as: "User", // ← alias obligatorio
});
// Un turno pertenece a un atendedor (médico)
Turns_js_1.default.belongsTo(Users_js_1.default, {
    foreignKey: "attendantID",
    as: "Attendant", // ← alias obligatorio
});
Users_js_1.default.hasMany(Turns_js_1.default, {
    foreignKey: "userID",
    as: "ClientTurns",
});
Users_js_1.default.hasMany(Turns_js_1.default, {
    foreignKey: "attendantID",
    as: "AttendedTurns",
});
// Una review pertenece a un usuario (cliente)
Reviews_js_1.default.belongsTo(Users_js_1.default, {
    foreignKey: "userID",
    as: "User", // ← alias obligatorio
});
Reviews_js_1.default.belongsTo(Users_js_1.default, { as: "Attendant", foreignKey: "attendantID" });
