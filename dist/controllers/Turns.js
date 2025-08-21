"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeTurn = exports.cancelTurn = exports.addCommentsAdmin = exports.attendantCreateTurn = exports.createTurn = exports.getCanceledAttendantTurns = exports.getCompletedAttendantTurns = exports.getScheduledAttendantTurns = exports.getAttendantTurnsByDate = exports.getAllAttendantTurns = exports.getCanceledAdminTurns = exports.getCompletedAdminTurns = exports.getScheduledAdminTurns = exports.getNotScheduledUserTurns = exports.getCanceledUserTurns = exports.getCompletedUserTurns = exports.getScheduledUserTurns = exports.getAllUserTurns = void 0;
const UserRole_1 = require("../models/enums/UserRole");
const UserStatus_1 = require("../models/enums/UserStatus");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../models/config");
const Users_1 = require("../models/Users");
const Turns_1 = __importDefault(require("../models/mysql/Turns"));
const sequelize_1 = require("sequelize");
const Availability_1 = require("./Availability");
const Users_2 = __importDefault(require("../models/mysql/Users"));
const Socialworks_1 = __importDefault(require("../models/mysql/Socialworks"));
const getAllUserTurns = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield getUserLogged(req);
        if (!user) {
            return res
                .status(401)
                .json({ message: "No tenes permiso a realizar estas acciones." });
        }
        const turns = yield Turns_1.default.findAll({
            where: { userID: user.id },
            order: [["date", "DESC"]],
            include: [
                {
                    model: Users_2.default,
                    as: "User", // ← cliente
                    attributes: ["fullName", "userID"],
                    include: [
                        {
                            model: Socialworks_1.default,
                            attributes: ["name"],
                        },
                    ],
                },
                {
                    model: Users_2.default,
                    as: "Attendant", // ← médico
                    attributes: ["id", "fullName", "profileImage", "userID"],
                },
            ],
        });
        if (!turns) {
            return res.status(404).json({ message: "Error, turns not found" });
        }
        return res.json(turns);
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.getAllUserTurns = getAllUserTurns;
const getScheduledUserTurns = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield getUserLogged(req);
        if (!user) {
            return res
                .status(401)
                .json({ message: "No tenes permiso a realizar estas acciones." });
        }
        const turns = yield Turns_1.default.findAll({
            where: { userID: user.id, status: "scheduled" },
            order: [["date", "DESC"]],
            include: [
                {
                    model: Users_2.default,
                    as: "User", // ← cliente
                    attributes: ["fullName", "userID"],
                    include: [
                        {
                            model: Socialworks_1.default,
                            attributes: ["name"],
                        },
                    ],
                },
                {
                    model: Users_2.default,
                    as: "Attendant", // ← médico
                    attributes: ["id", "fullName", "profileImage", "userID"],
                },
            ],
        });
        if (!turns) {
            return res.status(404).json({ message: "Error, turns not found" });
        }
        return res.json(turns);
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.getScheduledUserTurns = getScheduledUserTurns;
const getCompletedUserTurns = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield getUserLogged(req);
        if (!user) {
            return res
                .status(401)
                .json({ message: "No tenes permiso a realizar estas acciones." });
        }
        const turns = yield Turns_1.default.findAll({
            where: { userID: user.id, status: "completed" },
            order: [["date", "DESC"]],
            include: [
                {
                    model: Users_2.default,
                    as: "User", // ← cliente
                    attributes: ["fullName", "userID"],
                    include: [
                        {
                            model: Socialworks_1.default,
                            attributes: ["name"],
                        },
                    ],
                },
                {
                    model: Users_2.default,
                    as: "Attendant", // ← médico
                    attributes: ["id", "fullName", "profileImage", "userID"],
                },
            ],
        });
        if (!turns) {
            return res.status(404).json({ message: "Error, turns not found" });
        }
        return res.json(turns);
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.getCompletedUserTurns = getCompletedUserTurns;
const getCanceledUserTurns = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield getUserLogged(req);
        if (!user) {
            return res
                .status(401)
                .json({ message: "No tenes permiso a realizar estas acciones." });
        }
        const turns = yield Turns_1.default.findAll({
            where: { userID: user.id, status: "canceled" },
            order: [["date", "DESC"]],
            include: [
                {
                    model: Users_2.default,
                    as: "User", // ← cliente
                    attributes: ["fullName", "userID"],
                    include: [
                        {
                            model: Socialworks_1.default,
                            attributes: ["name"],
                        },
                    ],
                },
                {
                    model: Users_2.default,
                    as: "Attendant", // ← médico
                    attributes: ["id", "fullName", "profileImage", "userID"],
                },
            ],
        });
        if (!turns) {
            return res.status(404).json({ message: "Error, turns not found" });
        }
        return res.json(turns);
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.getCanceledUserTurns = getCanceledUserTurns;
const getNotScheduledUserTurns = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield getUserLogged(req);
        if (!user) {
            return res
                .status(401)
                .json({ message: "No tenes permiso a realizar estas acciones." });
        }
        const turns = yield Turns_1.default.findAll({
            where: {
                userID: user.id,
                status: { [sequelize_1.Op.or]: ["completed", "canceled"] },
            },
            order: [["date", "DESC"]],
            include: [
                {
                    model: Users_2.default,
                    as: "User", // ← cliente
                    attributes: ["fullName", "userID"],
                    include: [
                        {
                            model: Socialworks_1.default,
                            attributes: ["name"],
                        },
                    ],
                },
                {
                    model: Users_2.default,
                    as: "Attendant", // ← médico
                    attributes: ["id", "fullName", "profileImage", "userID"],
                },
            ],
        });
        if (!turns) {
            return res.status(404).json({ message: "Error, turns not found" });
        }
        return res.json(turns);
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.getNotScheduledUserTurns = getNotScheduledUserTurns;
const getScheduledAdminTurns = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield getUserLogged(req);
        if (!user || user.role !== UserRole_1.UserRole.ADMIN) {
            return res
                .status(401)
                .json({ message: "No tenes permiso a realizar estas acciones." });
        }
        const turns = yield Turns_1.default.findAll({
            where: { status: "scheduled" },
            order: [["date", "DESC"]],
            include: [
                {
                    model: Users_2.default,
                    as: "User", // ← cliente
                    attributes: ["fullName", "userID"],
                    include: [
                        {
                            model: Socialworks_1.default,
                            attributes: ["name"],
                        },
                    ],
                },
                {
                    model: Users_2.default,
                    as: "Attendant", // ← médico
                    attributes: ["id", "fullName", "profileImage", "userID"],
                },
            ],
        });
        if (!turns) {
            return res.status(404).json({ message: "Error, turns not found" });
        }
        return res.json(turns);
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.getScheduledAdminTurns = getScheduledAdminTurns;
const getCompletedAdminTurns = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield getUserLogged(req);
        if (!user || user.role !== UserRole_1.UserRole.ADMIN) {
            return res
                .status(401)
                .json({ message: "No tenes permiso a realizar estas acciones." });
        }
        const turns = yield Turns_1.default.findAll({
            where: { status: "completed" },
            order: [["date", "DESC"]],
            include: [
                {
                    model: Users_2.default,
                    as: "User", // ← cliente
                    attributes: ["fullName", "userID"],
                    include: [
                        {
                            model: Socialworks_1.default,
                            attributes: ["name"],
                        },
                    ],
                },
                {
                    model: Users_2.default,
                    as: "Attendant", // ← médico
                    attributes: ["id", "fullName", "profileImage", "userID"],
                },
            ],
        });
        if (!turns) {
            return res.status(404).json({ message: "Error, turns not found" });
        }
        return res.json(turns);
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.getCompletedAdminTurns = getCompletedAdminTurns;
const getCanceledAdminTurns = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield getUserLogged(req);
        if (!user || user.role !== UserRole_1.UserRole.ADMIN) {
            return res
                .status(401)
                .json({ message: "No tenes permiso a realizar estas acciones." });
        }
        const turns = yield Turns_1.default.findAll({
            where: { status: "canceled" },
            order: [["date", "DESC"]],
            include: [
                {
                    model: Users_2.default,
                    as: "User", // ← cliente
                    attributes: ["fullName", "userID"],
                    include: [
                        {
                            model: Socialworks_1.default,
                            attributes: ["name"],
                        },
                    ],
                },
                {
                    model: Users_2.default,
                    as: "Attendant", // ← médico
                    attributes: ["id", "fullName", "profileImage", "userID"],
                },
            ],
        });
        if (!turns) {
            return res.status(404).json({ message: "Error, turns not found" });
        }
        return res.json(turns);
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.getCanceledAdminTurns = getCanceledAdminTurns;
const getAllAttendantTurns = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield getUserLogged(req);
        if (!user) {
            return res
                .status(401)
                .json({ message: "No tenes permiso a realizar estas acciones." });
        }
        const turns = yield Turns_1.default.findAll({
            where: { attendantID: user.id },
            order: [["date", "DESC"]],
            include: [
                {
                    model: Users_2.default,
                    as: "User", // ← cliente
                    attributes: ["fullName", "userID"],
                    include: [
                        {
                            model: Socialworks_1.default,
                            attributes: ["name"],
                        },
                    ],
                },
                {
                    model: Users_2.default,
                    as: "Attendant", // ← médico
                    attributes: ["id", "fullName", "profileImage", "userID"],
                },
            ],
        });
        if (!turns) {
            return res.status(404).json({ message: "Error, turns not found" });
        }
        return res.json(turns);
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.getAllAttendantTurns = getAllAttendantTurns;
function hasAvailableHour(startHour, endHour, turns) {
    const availableHours = [];
    for (let hour = startHour; hour < endHour; hour++) {
        availableHours.push(hour);
    }
    for (const turn of turns) {
        const turnHour = new Date(turn.date).getHours();
        const index = availableHours.indexOf(turnHour);
        if (index !== -1) {
            availableHours.splice(index, 1);
        }
    }
    const formattedHours = availableHours.map((hour) => `${hour.toString().padStart(2, "0")}:00`);
    return formattedHours; // Si queda alguna hora libre, hay disponibilidad
}
function validateParametersAvailability(startHour, endHour, date) {
    if (typeof startHour !== "number" ||
        typeof endHour !== "number" ||
        !(date instanceof Date)) {
        return false;
    }
    return true;
}
/*function parseHourToNumber(hourStr: string): number {
  if (typeof hourStr !== "string") return NaN;
  const [hours, minutes] = hourStr.split(":").map(Number);
  if (isNaN(hours) || isNaN(minutes)) return NaN;
  return hours + minutes / 60;
}*/
const getAttendantTurnsByDate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield getUserLogged(req);
        if (!user) {
            return res
                .status(401)
                .json({ message: "No tenes permiso a realizar estas acciones." });
        }
        const { attendantID } = req.params;
        let { startHour, endHour, date } = req.body;
        //startHour = parseHourToNumber(startHour); // → 8
        //endHour = parseHourToNumber(endHour); // → 17
        date = new Date(date);
        if (!attendantID || !startHour || !endHour || !date) {
            return res.status(400).json({ message: "Faltan datos en la petición" });
        }
        if (!validateParametersAvailability(startHour, endHour, date)) {
            return res
                .status(400)
                .json({ message: "Datos incorrectos en la petición" });
        }
        const startOfDay = new Date(date);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setUTCHours(23, 59, 59, 999);
        const turns = yield Turns_1.default.findAll({
            where: {
                attendantID: attendantID,
                date: { [sequelize_1.Op.between]: [startOfDay, endOfDay] },
                status: "scheduled",
            },
            order: [["date", "DESC"]],
        });
        if (!turns) {
            return res.status(404).json({ message: "Error, turns not found" });
        }
        const availableHours = hasAvailableHour(startHour, endHour, turns);
        return res
            .status(200)
            .json({ isValid: availableHours.length > 0, hours: availableHours });
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.getAttendantTurnsByDate = getAttendantTurnsByDate;
const getScheduledAttendantTurns = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield getUserLogged(req);
        if (!user) {
            return res
                .status(401)
                .json({ message: "No tenes permiso a realizar estas acciones." });
        }
        const turns = yield Turns_1.default.findAll({
            where: { attendantID: user.id, status: "scheduled" },
            order: [["date", "DESC"]],
            include: [
                {
                    model: Users_2.default,
                    as: "User", // ← cliente
                    attributes: ["fullName", "userID"],
                    include: [
                        {
                            model: Socialworks_1.default,
                            attributes: ["name"],
                        },
                    ],
                },
                {
                    model: Users_2.default,
                    as: "Attendant", // ← médico
                    attributes: ["id", "fullName", "userID"],
                },
            ],
        });
        if (!turns) {
            return res.status(404).json({ message: "Error, turns not found" });
        }
        return res.json(turns);
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.getScheduledAttendantTurns = getScheduledAttendantTurns;
const getCompletedAttendantTurns = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield getUserLogged(req);
        if (!user) {
            return res
                .status(401)
                .json({ message: "No tenes permiso a realizar estas acciones." });
        }
        const turns = yield Turns_1.default.findAll({
            where: { attendantID: user.id, status: "completed" },
            order: [["date", "DESC"]],
            include: [
                {
                    model: Users_2.default,
                    as: "User", // ← cliente
                    attributes: ["fullName", "userID"],
                    include: [
                        {
                            model: Socialworks_1.default,
                            attributes: ["name"],
                        },
                    ],
                },
                {
                    model: Users_2.default,
                    as: "Attendant", // ← médico
                    attributes: ["id", "fullName", "userID"],
                },
            ],
        });
        if (!turns) {
            return res.status(404).json({ message: "Error, turns not found" });
        }
        return res.json(turns);
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.getCompletedAttendantTurns = getCompletedAttendantTurns;
const getCanceledAttendantTurns = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield getUserLogged(req);
        if (!user) {
            return res
                .status(401)
                .json({ message: "No tenes permiso a realizar estas acciones." });
        }
        const turns = yield Turns_1.default.findAll({
            where: { attendantID: user.id, status: "canceled" },
            order: [["date", "DESC"]],
            include: [
                {
                    model: Users_2.default,
                    as: "User", // ← cliente
                    attributes: ["fullName", "userID"],
                    include: [
                        {
                            model: Socialworks_1.default,
                            attributes: ["name"],
                        },
                    ],
                },
                {
                    model: Users_2.default,
                    as: "Attendant", // ← médico
                    attributes: ["id", "fullName", "userID"],
                },
            ],
        });
        if (!turns) {
            return res.status(404).json({ message: "Error, turns not found" });
        }
        return res.json(turns);
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.getCanceledAttendantTurns = getCanceledAttendantTurns;
const createTurn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield getUserLogged(req);
        if (!user) {
            return res
                .status(401)
                .json({ message: "No tenes permiso a realizar estas acciones." });
        }
        let { attendantID, date, place, comments } = req.body;
        if (!validateTurn(attendantID, date, place)) {
            return res
                .status(400)
                .json({ message: "No todos los campos contienen un valor." });
        }
        const userID = user.id;
        const isAvailable = yield (0, Availability_1.isAttendantAvailable)(attendantID, date);
        if (!(isAvailable === null || isAvailable === void 0 ? void 0 : isAvailable.available)) {
            return res
                .status(401)
                .json({ message: (isAvailable === null || isAvailable === void 0 ? void 0 : isAvailable.message) || "Not available" });
        }
        const turns = { date, place, userID, attendantID, comments };
        yield Turns_1.default.create(turns);
        return res.status(200).json("Turn created successfully");
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.createTurn = createTurn;
const attendantCreateTurn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield getUserLogged(req);
        if (!user) {
            return res
                .status(401)
                .json({ message: "No tenes permiso a realizar estas acciones." });
        }
        let { userID, date, place, comments } = req.body;
        if (!validateTurn(userID, date, place)) {
            return res
                .status(400)
                .json({ message: "No todos los campos contienen un valor." });
        }
        const attendantID = user.id;
        const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes());
        const isAvailable = yield (0, Availability_1.isAttendantAvailable)(attendantID, date);
        if (!(isAvailable === null || isAvailable === void 0 ? void 0 : isAvailable.available)) {
            return res.status(304).json((isAvailable === null || isAvailable === void 0 ? void 0 : isAvailable.message) || "Not available");
        }
        const turns = { date, place, userID, attendantID, comments };
        yield Turns_1.default.create(turns);
        return res.status(200).json("Turn created successfully");
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.attendantCreateTurn = attendantCreateTurn;
function validateTurn(attendantID, date, place) {
    if (!attendantID || !date || !place) {
        return false;
    }
    if (typeof attendantID !== "string" || typeof place !== "string") {
        return false;
    }
    const parsedDate = new Date(date);
    const isValidDate = parsedDate instanceof Date && !isNaN(parsedDate.getTime());
    if (!isValidDate) {
        return false;
    }
    return true;
}
const addCommentsAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield getUserLogged(req);
        if (!user) {
            return res
                .status(401)
                .json({ message: "No tenes permiso a realizar estas acciones." });
        }
        const { comments } = req.body;
        const { turnID } = req.params;
        console.log("COMMENTS: ", comments);
        if (!turnID) {
            return res
                .status(400)
                .json({ message: "No todos los campos contienen un valor." });
        }
        let turn = yield Turns_1.default.findByPk(turnID);
        if (!turn) {
            return res.status(404).json({ message: "Turno no encontrado." });
        }
        if (typeof comments !== "string") {
            return res
                .status(400)
                .json({ message: "Los comentarios deben ser de tipo texto" });
        }
        turn.comments = comments;
        yield turn.save();
        return res.status(200).json("Turn created successfully");
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.addCommentsAdmin = addCommentsAdmin;
const cancelTurn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield getUserLogged(req);
        if (!user) {
            return res
                .status(401)
                .json({ message: "No tenes permiso a realizar estas acciones." });
        }
        if (user.role === UserRole_1.UserRole.CLIENT) {
            return res
                .status(401)
                .json({ message: "No tenes permiso a realizar estas acciones." });
        }
        let { id } = req.params;
        if (!id) {
            return res
                .status(400)
                .json({ message: "No todos los campos contienen un valor." });
        }
        const turn = yield Turns_1.default.findByPk(id);
        if (!turn) {
            return res.status(404).json({ message: "Turn not found" });
        }
        if (turn.getDataValue("status") !== "scheduled") {
            return res.status(401).json({
                message: "No se puede cancelar un turno ya completado o cancelado",
            });
        }
        turn.set("status", "canceled");
        yield turn.save(); // No olvides guardar los cambios
        return res.status(200).json({ message: "Canceled successfully" });
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.cancelTurn = cancelTurn;
const completeTurn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield getUserLogged(req);
        if (!user) {
            return res
                .status(401)
                .json({ message: "No tenes permiso a realizar estas acciones." });
        }
        if (user.role === UserRole_1.UserRole.CLIENT) {
            return res
                .status(401)
                .json({ message: "No tenes permiso a realizar estas acciones." });
        }
        let { id } = req.params;
        if (!id) {
            return res
                .status(400)
                .json({ message: "No todos los campos contienen un valor." });
        }
        const turn = yield Turns_1.default.findByPk(id);
        if (!turn) {
            return res.status(404).json({ message: "Turn not found." });
        }
        if (turn.getDataValue("status") !== "scheduled") {
            return res.status(401).json({
                message: "No se puede completar un turno ya completado o cancelado",
            });
        }
        turn.set("status", "completed");
        yield turn.save();
        return res.status(200).json({ message: "completed successfully" });
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.completeTurn = completeTurn;
function getUserLogged(req) {
    return __awaiter(this, void 0, void 0, function* () {
        let access = req.cookies["access_token"];
        let user = new Users_1.User("", "", "", "", "", "", UserRole_1.UserRole.CLIENT, UserStatus_1.UserStatus.ACTIVE, "", "");
        if (access) {
            let userAux = yield getToken(access);
            if (userAux) {
                user = userAux;
            }
            return user;
        }
        return undefined;
    });
}
function getToken(tokenAux) {
    return __awaiter(this, void 0, void 0, function* () {
        let user = new Users_1.User("", "", "", "", "", "", UserRole_1.UserRole.CLIENT, UserStatus_1.UserStatus.ACTIVE, "", "");
        try {
            const data = jsonwebtoken_1.default.verify(tokenAux, config_1.SECRET_JWT_KEY);
            if (typeof data === "object" && data !== null) {
                user = data; // Casting si estás seguro que data contiene propiedades de User
                return user;
            }
            else {
                return null;
            }
        }
        catch (error) {
            return null;
        }
    });
}
