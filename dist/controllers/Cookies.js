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
exports.superAdminCheck = exports.getToken = exports.tokenExist = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../models/config");
const tokenExist = (req, res) => {
    const { cookieName } = req.params;
    const token = req.cookies[cookieName];
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken) {
        if (token) {
            return res.json(true); // Usamos return para evitar que siga ejecutando código
        }
        else {
            return res.json(false); // Usamos return para evitar que siga ejecutando código
        }
    }
    else {
        if (cookieName == "admin_token") {
            if (!token) {
                return res.json(false); // Usamos return para evitar que siga ejecutando código
            }
            else {
                const adminToken = jsonwebtoken_1.default.verify(token, config_1.SECRET_JWT_KEY);
                if (typeof adminToken === "object" && token !== null) {
                    const userAux = adminToken;
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
                    return res.json(access);
                }
                else {
                    res.json(false);
                }
            }
        }
        else {
            try {
                const data = jsonwebtoken_1.default.verify(refreshToken, config_1.SECRET_JWT_KEY);
                if (typeof data === "object" && data !== null) {
                    const user = data; // Casting si estás seguro que data contiene propiedades de User
                    const access_token = jsonwebtoken_1.default.sign({
                        id: user.id,
                        email: user.email,
                        username: user.username,
                        client: user.client,
                    }, config_1.SECRET_JWT_KEY, { expiresIn: "1h" });
                    res.cookie("access_token", access_token, {
                        path: "/",
                        httpOnly: true,
                        secure: true,
                        domain: ".distribucionlosvascos.com", // Comparte la cookie entre www.localhost.com y api.localhost.com
                        ///domain: '.distribucionlosvascos.com', // Comparte la cookie entre www.localhost.com y api.localhost.com
                        sameSite: "none",
                        maxAge: 1000 * 60 * 60,
                    });
                    let access = false;
                    let i = 0;
                    while (i < config_1.admin.length && !access) {
                        if (user.email === config_1.admin[i]) {
                            access = true;
                        }
                        else {
                            i++;
                        }
                    }
                    if (access) {
                        const admin_token = jsonwebtoken_1.default.sign({
                            id: user.id,
                            email: user.email,
                            username: user.username,
                            client: user.client,
                        }, config_1.SECRET_JWT_KEY, { expiresIn: "1h" });
                        res.cookie("admin_token", admin_token, {
                            path: "/",
                            httpOnly: true,
                            secure: true,
                            domain: ".distribucionlosvascos.com", // Comparte la cookie entre www.localhost.com y api.localhost.com
                            ///domain: '.distribucionlosvascos.com',
                            sameSite: "none",
                            maxAge: 1000 * 60 * 60,
                        });
                    }
                    return res.json(true); // Usamos return para evitar que siga ejecutando código
                }
                else {
                    return res.status(401).send("Acceso denegado"); // Enviamos respuesta y detenemos la ejecución
                }
            }
            catch (error) {
                return res.status(401).send("acceso denegado"); // Enviamos respuesta en caso de error y detenemos la ejecución
            }
        }
    }
};
exports.tokenExist = tokenExist;
const getToken = (req, res) => {
    const { cookieName } = req.params;
    const token = req.cookies[cookieName];
    if (!token) {
        return res.json(false); // Usamos return para detener la ejecución
    }
    else {
        try {
            const data = jsonwebtoken_1.default.verify(token, config_1.SECRET_JWT_KEY);
            if (typeof data === "object" && data !== null) {
                const user = data; // Casting si estás seguro que data contiene propiedades de User
                return res.json(user); // Enviamos la respuesta y terminamos la ejecución
            }
            else {
                return res.status(401).send("Acceso denegado"); // Enviamos respuesta de error y detenemos la ejecución
            }
        }
        catch (error) {
            return res.status(401).send("acceso denegado"); // Enviamos respuesta de error en caso de excepción
        }
    }
};
exports.getToken = getToken;
const superAdminCheck = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { admin } = req.params;
    if (admin) {
        let i = 0;
        let access = false;
        while (i < config_1.superAdmin.length && !access) {
            if (admin == config_1.superAdmin[i]) {
                access = true;
            }
            else {
                i++;
            }
        }
        if (access) {
            res.json(true);
        }
        else {
            res.json(false);
        }
    }
});
exports.superAdminCheck = superAdminCheck;
