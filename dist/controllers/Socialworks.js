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
exports.postSocialwork = exports.getSocialworkByAttendant = exports.SetinActiveSocialwork = exports.SetActiveSocialwork = exports.getAllSocialworks = exports.getinActiveSocialworks = exports.getActiveSocialworks = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../models/config");
const UserRole_1 = require("../models/enums/UserRole");
const UserStatus_1 = require("../models/enums/UserStatus");
const associations_1 = require("../models/mysql/associations");
const Users_1 = require("../models/Users");
const getActiveSocialworks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const activeSocialworks = yield associations_1.Socialworks.findAll({
            where: { active: true },
        });
        if (!activeSocialworks) {
            return res
                .status(404)
                .json({ message: "No active attendants at the moment" });
        }
        return res.json(activeSocialworks);
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.getActiveSocialworks = getActiveSocialworks;
const getinActiveSocialworks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const inactiveSocialworks = yield associations_1.Socialworks.findAll({
            where: { active: false },
        });
        if (!inactiveSocialworks) {
            return res
                .status(404)
                .json({ message: "No active attendants at the moment" });
        }
        return res.json(inactiveSocialworks);
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.getinActiveSocialworks = getinActiveSocialworks;
const getAllSocialworks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allSocialworks = yield associations_1.Socialworks.findAll({
            order: [
                ["active", "DESC"], // primero los activos (true), luego inactivos (false)
                ["name", "ASC"], // dentro de cada grupo, ordenar alfabéticamente
            ],
        });
        if (!allSocialworks) {
            return res
                .status(404)
                .json({ message: "No active attendants at the moment" });
        }
        return res.json(allSocialworks);
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.getAllSocialworks = getAllSocialworks;
const SetActiveSocialwork = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield getUserLogged(req);
        if (!user) {
            return res
                .status(401)
                .json({ message: "You're not allowed to see this information." });
        }
        if (user.role !== UserRole_1.UserRole.ADMIN) {
            return res
                .status(401)
                .json({ message: "You're not allowed to see this information." });
        }
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                message: "Not all fields contains a value.",
            });
        }
        const activeSocialwork = yield associations_1.Socialworks.findOne({
            where: { id: id, active: false },
        });
        if (!activeSocialwork) {
            return res
                .status(404)
                .json({ message: "No social work matches this requirements" });
        }
        activeSocialwork.set("active", true);
        yield activeSocialwork.save();
        return res.json({ message: "Social work set to active" });
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.SetActiveSocialwork = SetActiveSocialwork;
const SetinActiveSocialwork = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield getUserLogged(req);
        if (!user) {
            return res
                .status(401)
                .json({ message: "You're not allowed to see this information." });
        }
        if (user.role !== UserRole_1.UserRole.ADMIN) {
            return res
                .status(401)
                .json({ message: "You're not allowed to see this information." });
        }
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                message: "Not all fields contains a value.",
            });
        }
        const inactiveSocialwork = yield associations_1.Socialworks.findOne({
            where: { id: id, active: true },
        });
        if (!inactiveSocialwork) {
            return res
                .status(404)
                .json({ message: "No social work matches this requirements" });
        }
        inactiveSocialwork.set("active", false);
        yield inactiveSocialwork.save();
        return res.json({ message: "Social work set to active" });
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.SetinActiveSocialwork = SetinActiveSocialwork;
const getSocialworkByAttendant = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { attendantID } = req.params;
        if (!attendantID) {
            return res.status(400).json({
                message: "Not all fields contains a value.",
            });
        }
        const socialworks = yield associations_1.Socialworks.findAll({
            where: { active: true },
            include: [
                {
                    model: associations_1.AttendantXSocialworks,
                    where: { attendantID: attendantID },
                },
            ],
        });
        if (!socialworks) {
            return res.status(404).json({
                message: "No attendants at the moment with the current social work",
            });
        }
        return res.json(socialworks);
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.getSocialworkByAttendant = getSocialworkByAttendant;
const postSocialwork = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield getUserLogged(req);
        if (!user) {
            return res
                .status(401)
                .json({ message: "You're not allowed to see this information." });
        }
        if (user.role !== UserRole_1.UserRole.ADMIN) {
            return res
                .status(401)
                .json({ message: "You're not allowed to see this information." });
        }
        const body = req.body;
        if (!body.name ||
            !body.id ||
            typeof body.name !== "string" ||
            typeof body.id !== "string") {
            return res.status(400).json({ message: "Error en la carga de datos" });
        }
        const socialwork = {
            id: body.id,
            name: body.name,
            active: true,
        };
        yield associations_1.Socialworks.create(socialwork);
        return res
            .status(200)
            .json({ message: "Cobertura médica cargada correctamente" });
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.postSocialwork = postSocialwork;
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
