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
exports.deleteAttendantXSocialwork = exports.postAttendantXSocialwork = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../models/config");
const UserRole_1 = require("../models/enums/UserRole");
const UserStatus_1 = require("../models/enums/UserStatus");
const associations_1 = require("../models/mysql/associations");
const Users_1 = require("../models/Users");
const postAttendantXSocialwork = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const body = req.body;
        if (!body.attendantID ||
            !body.socialworkID ||
            !body.id ||
            typeof body.attendantID !== "string" ||
            typeof body.socialworkID !== "string" ||
            typeof body.id !== "string") {
            return res.status(400).json({ message: "Error en la carga de datos" });
        }
        const attendantXsocialwork = {
            id: body.id,
            attendantID: body.attendantID,
            socialworkID: body.socialworkID,
        };
        yield associations_1.AttendantXSocialworks.create(attendantXsocialwork);
        return res
            .status(200)
            .json({ message: "Cobertura médica del doctor cargada correctamente" });
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.postAttendantXSocialwork = postAttendantXSocialwork;
const deleteAttendantXSocialwork = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const { attendantID, socialworkID } = req.params;
        if (!attendantID ||
            !socialworkID ||
            typeof attendantID !== "string" ||
            typeof socialworkID !== "string") {
            return res
                .status(400)
                .json({ message: "Not all fields contains a value." });
        }
        const attendantXSocialworkToDelete = yield associations_1.AttendantXSocialworks.findOne({
            where: { attendantID: attendantID, socialworkID: socialworkID },
        });
        if (!attendantXSocialworkToDelete) {
            return res.status(404).json({
                message: "Cannot delete: we didn't found this attendantXSocialwork",
            });
        }
        yield attendantXSocialworkToDelete.destroy();
        return res
            .status(200)
            .json({ message: "attendantXSocialwork deleted successfully" });
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.deleteAttendantXSocialwork = deleteAttendantXSocialwork;
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
