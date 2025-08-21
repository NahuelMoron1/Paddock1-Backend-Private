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
exports.deleteUsers = exports.updateUser = exports.postUser = exports.deleteUser = exports.getUserXcoupon = void 0;
const UserXcoupon_1 = __importDefault(require("../models/mysql/UserXcoupon"));
const config_1 = require("../models/config");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_2 = require("../models/config");
const getUserXcoupon = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userID, couponID } = req.params;
    const UserAux = yield UserXcoupon_1.default.findOne({ where: { userID: userID, couponID: couponID } });
    if (UserAux) {
        res.json(UserAux);
    }
    else {
        res.status(404).json({ message: 'Error, User not found' });
    }
});
exports.getUserXcoupon = getUserXcoupon;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const access_token = req.cookies.access_token;
    const admin_token = req.cookies.admin_token;
    if (access_token && admin_token) {
        if (verifyAdmin(admin_token)) {
            const { id } = req.params;
            const UserAux = yield UserXcoupon_1.default.findByPk(`${id}`);
            if (UserAux) {
                yield UserAux.destroy();
                res.json({ message: 'User successfully deleted' });
            }
            else {
                res.status(404).json({ message: 'Error, User not found' });
            }
        }
        else {
            res.send('Ruta protegida');
        }
    }
    else {
        res.send('Ruta protegida');
    }
});
exports.deleteUser = deleteUser;
const postUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const access_token = req.cookies.access_token;
    const admin_token = req.cookies.admin_token;
    if (access_token && admin_token) {
        if (verifyAdmin(admin_token)) {
            const body = req.body;
            yield UserXcoupon_1.default.create(body);
            res.json({
                message: 'User successfully created',
            });
        }
        else {
            res.send('Ruta protegida');
        }
    }
    else {
        res.send('Ruta protegida');
    }
});
exports.postUser = postUser;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const { id } = req.params;
    const UserAux = yield UserXcoupon_1.default.findByPk(id);
    if (UserAux) {
        UserAux.update(body);
        res.json({
            message: 'User updated',
        });
    }
    else {
        res.status(404).json({ message: 'Error, User not found' });
    }
});
exports.updateUser = updateUser;
const deleteUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const access_token = req.cookies.access_token;
    const admin_token = req.cookies.admin_token;
    if (access_token && admin_token) {
        if (verifyAdmin(admin_token)) {
            yield UserXcoupon_1.default.destroy({ truncate: true });
        }
        else {
            res.send('Ruta protegida');
        }
    }
    else {
        res.send('Ruta protegida');
    }
});
exports.deleteUsers = deleteUsers;
const verifyAdmin = (adminToken) => {
    const dataAdmin = jsonwebtoken_1.default.verify(adminToken, config_2.SECRET_JWT_KEY);
    if (typeof dataAdmin === 'object' && dataAdmin !== null) {
        const userAux = dataAdmin;
        let access = false;
        let i = 0;
        while (i < config_1.admin.length && !access) {
            if (userAux.email === config_1.admin[i]) {
                access = true;
            }
            else {
                i++;
            }
        }
        if (access) {
            return true;
        }
        else {
            return false;
        }
    }
    else {
        return false;
    }
};
