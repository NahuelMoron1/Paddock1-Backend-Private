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
exports.deleteAttendantAvailability = exports.modifyAttendantAvailability = exports.postAttendantAvailability = exports.checkAttendantAvailability = exports.isAttendantAvailable = exports.getAttendantAvailability = void 0;
const Availability_1 = __importDefault(require("../models/mysql/Availability"));
const UserRole_1 = require("../models/enums/UserRole");
const config_1 = require("../models/config");
const UserStatus_1 = require("../models/enums/UserStatus");
const Users_1 = require("../models/Users");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sequelize_1 = require("sequelize");
const getAttendantAvailability = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { attendantID } = req.params;
        if (!attendantID) {
            return res
                .status(400)
                .json({ message: "Not all fields contains a value." });
        }
        const availability = yield Availability_1.default.findAll({
            where: { attendantID: attendantID },
        });
        if (!availability) {
            return res.status(404).json({ message: "No availability found" });
        }
        const dayOrder = [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
        ];
        const sortedAvailability = availability.sort((a, b) => dayOrder.indexOf(a.dayOfWeek) - dayOrder.indexOf(b.dayOfWeek));
        return res.json(sortedAvailability);
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.getAttendantAvailability = getAttendantAvailability;
const isAttendantAvailable = (attendantID, date) => __awaiter(void 0, void 0, void 0, function* () {
    if (!attendantID || !date) {
        return {
            available: false,
            message: "Not all fields have a value",
        };
    }
    try {
        const datetime = new Date(date);
        console.log("DATETIME: ", datetime);
        // 1. Obtener día de la semana en inglés (ej: "Monday")
        const dayOfWeek = datetime.toLocaleDateString("en-US", { weekday: "long" });
        // 2. Obtener la hora en formato "HH:mm"
        const hour = datetime.toTimeString().slice(0, 5); // ej: "14:30"
        // 3. Buscar disponibilidad para ese día y que cubra ese horario
        console.log(dayOfWeek);
        console.log(hour);
        const availability = yield Availability_1.default.findOne({
            where: {
                attendantID,
                dayOfWeek,
                startTime: { [sequelize_1.Op.lte]: hour },
                endTime: { [sequelize_1.Op.gte]: hour },
            },
        });
        if (availability) {
            return { available: true };
        }
        else {
            return {
                available: false,
                message: "No availability at that time",
            };
        }
    }
    catch (err) {
        return {
            available: false,
            message: "An error happened",
        };
    }
});
exports.isAttendantAvailable = isAttendantAvailable;
const checkAttendantAvailability = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { attendantID, date } = req.body;
        const isAvailable = yield (0, exports.isAttendantAvailable)(attendantID, date);
        if (!(isAvailable === null || isAvailable === void 0 ? void 0 : isAvailable.available)) {
            return res.status(304).send(false);
        }
        return res.status(200).send(true);
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.checkAttendantAvailability = checkAttendantAvailability;
const postAttendantAvailability = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield getUserLogged(req);
        if (!user) {
            return res
                .status(401)
                .json({ message: "You're not allowed to see this information." });
        }
        if (user.role !== UserRole_1.UserRole.ATTENDANT) {
            return res
                .status(401)
                .json({ message: "You're not allowed to see this information." });
        }
        const { dayOfWeek, startTime, endTime } = req.body;
        if (!validateAvailability(dayOfWeek, startTime, endTime)) {
            return res
                .status(400)
                .json({ message: "Not all fields contains a value." });
        }
        const attendantID = user.id;
        const availability = { attendantID, dayOfWeek, startTime, endTime };
        yield Availability_1.default.create(availability);
        return res
            .status(200)
            .json({ message: "availability created successfully" });
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.postAttendantAvailability = postAttendantAvailability;
function validateAvailability(dayOfWeek, startTime, endTime) {
    if (!dayOfWeek || !startTime || !endTime) {
        return false;
    }
    return true;
}
const modifyAttendantAvailability = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield getUserLogged(req);
        if (!user) {
            return res
                .status(401)
                .json({ message: "You're not allowed to see this information." });
        }
        if (user.role !== UserRole_1.UserRole.ATTENDANT) {
            return res
                .status(401)
                .json({ message: "You're not allowed to see this information." });
        }
        const { id, dayOfWeek, startTime, endTime } = req.body;
        if (!dayOfWeek && !startTime && !endTime) {
            return res.status(400).json({ message: "Nothing sent to modify" });
        }
        const availabilityToModify = yield Availability_1.default.findByPk(id);
        if (!availabilityToModify) {
            return res
                .status(404)
                .json({ message: "Cannot modify: we didn't found this availability" });
        }
        if (dayOfWeek) {
            availabilityToModify.set("dayOfWeek", dayOfWeek);
        }
        if (startTime) {
            availabilityToModify.set("startTime", startTime);
        }
        if (endTime) {
            availabilityToModify.set("endTime", endTime);
        }
        yield availabilityToModify.save();
        return res
            .status(200)
            .json({ message: "Availability modificated successfully" });
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.modifyAttendantAvailability = modifyAttendantAvailability;
const deleteAttendantAvailability = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield getUserLogged(req);
        if (!user) {
            return res
                .status(401)
                .json({ message: "You're not allowed to see this information." });
        }
        if (user.role !== UserRole_1.UserRole.ATTENDANT) {
            return res
                .status(401)
                .json({ message: "You're not allowed to see this information." });
        }
        const { id } = req.params;
        if (!id) {
            return res
                .status(400)
                .json({ message: "Not all fields contains a value." });
        }
        const availabilityToDelete = yield Availability_1.default.findByPk(id);
        if (!availabilityToDelete) {
            return res
                .status(404)
                .json({ message: "Cannot delete: we didn't found this availability" });
        }
        yield availabilityToDelete.destroy();
        return res
            .status(200)
            .json({ message: "Availability deleted successfully" });
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.deleteAttendantAvailability = deleteAttendantAvailability;
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
