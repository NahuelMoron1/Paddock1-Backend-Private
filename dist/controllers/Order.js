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
exports.deleteOrders = exports.updateOrder = exports.postOrder = exports.sendEmail = exports.deleteOrder = exports.getOrder = exports.searchOrders = exports.getOrdersAdmin = exports.getOrdersNotPayed = exports.getOrdersByUser = exports.getOrders = void 0;
const Orders_1 = __importDefault(require("../models/mysql/Orders"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const sequelize_1 = require("sequelize");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../models/config");
const getOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const admin_token = req.cookies.admin_token;
    const access_token = req.cookies.access_token;
    if (access_token && admin_token) {
        if (verifyAdmin(admin_token)) {
            const listOrders = yield Orders_1.default.findAll();
            res.json(listOrders);
        }
        else {
            res.send("Ruta protegida");
        }
    }
    else {
        res.send("No se puede acceder a las ordenes de compra de la empresa");
    }
});
exports.getOrders = getOrders;
/*export const getOrdersByUser = async (req: Request, res: Response) => {
    const admin_token = req.cookies.admin_token;
    const access_token = req.cookies.access_token;
    if (access_token) {
        const { userid } = req.params;
        if (verifyAdmin(admin_token)) {
            const ordersAux = await Order.findAll({ where: { userID: userid } });
            if (ordersAux) {
                res.json(ordersAux);
            } else {
                res.status(404).json({ message: 'Error, orders not found' })
            }
        } else {
            const data = jwt.verify(access_token, SECRET_JWT_KEY);
            if (typeof data === 'object' && data !== null) {
                const user: PublicUser = data as PublicUser; // Casting si estás seguro que data contiene propiedades de User
                if (user.id == userid) {
                    const ordersAux = await Order.findAll({ where: { userID: userid } });
                    if (ordersAux) {
                        res.json(ordersAux);
                    } else {
                        res.status(404).json({ message: 'Error, orders not found' })
                    }
                } else {
                    res.send('No podes acceder a ordenes de compra de otros usuarios');
                }
            }
        }
    } else {
        res.send('No podes acceder a las ordenes de compra si no estas logueado')
    }
}*/
const getOrdersByUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const admin_token = req.cookies.admin_token;
        const access_token = req.cookies.access_token;
        // Verifica si el token de acceso está presente
        if (!access_token) {
            return res.status(403).json({
                message: "No puedes acceder a las órdenes de compra si no estás logueado.",
            });
        }
        const { userid } = req.params;
        // Si es admin, puede acceder a cualquier orden
        if (verifyAdmin(admin_token)) {
            const ordersAux = yield Orders_1.default.findAll({ where: { userID: userid } });
            if (ordersAux.length > 0) {
                return res.json(ordersAux);
            }
            else {
                return res
                    .status(404)
                    .json({ message: "Error, órdenes no encontradas." });
            }
        }
        else {
            // Verificación para usuarios normales
            try {
                const data = jsonwebtoken_1.default.verify(access_token, config_1.SECRET_JWT_KEY);
                if (typeof data === "object" && data !== null) {
                    const user = data; // Casting si estás seguro que data contiene propiedades de User
                    // Solo puede acceder a sus propias órdenes
                    if (user.id == userid) {
                        const ordersAux = yield Orders_1.default.findAll({
                            where: { userID: userid },
                        });
                        if (ordersAux.length > 0) {
                            return res.json(ordersAux);
                        }
                        else {
                            return res
                                .status(404)
                                .json({ message: "Error, órdenes no encontradas." });
                        }
                    }
                    else {
                        return res.status(403).json({
                            message: "No puedes acceder a las órdenes de compra de otros usuarios.",
                        });
                    }
                }
                else {
                    return res.status(403).json({ message: "Token de acceso inválido." });
                }
            }
            catch (error) {
                return res
                    .status(401)
                    .json({ message: "Token de acceso inválido o expirado." });
            }
        }
    }
    catch (error) {
        return res
            .status(500)
            .json({ message: "Error al procesar la solicitud.", error });
    }
});
exports.getOrdersByUser = getOrdersByUser;
const getOrdersNotPayed = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const admin_token = req.cookies.admin_token;
    const access_token = req.cookies.access_token;
    if (access_token && admin_token) {
        if (verifyAdmin(admin_token)) {
            const { userid } = req.params;
            const ordersAux = yield Orders_1.default.findAll({
                where: { userId: userid, payed: false },
            });
            if (ordersAux) {
                res.json(ordersAux);
            }
            else {
                res.status(404).json({ message: "Error, orders not found" });
            }
        }
        else {
            res.send("Ruta protegida");
        }
    }
    else {
        res.send("Ruta protegida");
    }
});
exports.getOrdersNotPayed = getOrdersNotPayed;
const getOrdersAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const admin_token = req.cookies.admin_token;
    const access_token = req.cookies.access_token;
    if (access_token && admin_token) {
        if (verifyAdmin(admin_token)) {
            const ordersAux = yield Orders_1.default.findAll({ where: { attended: 0 } });
            if (ordersAux) {
                res.json(ordersAux);
            }
            else {
                res.status(404).json({ message: "Error, orders not found" });
            }
        }
        else {
            res.send("Ruta protegida");
        }
    }
    else {
        res.send("Ruta protegida");
    }
});
exports.getOrdersAdmin = getOrdersAdmin;
const searchOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const admin_token = req.cookies.admin_token;
    const access_token = req.cookies.access_token;
    if (access_token) {
        const { idcode } = req.params;
        const { userid } = req.params;
        let access = false;
        if (verifyAdmin(admin_token)) {
            access = true;
        }
        else {
            const data = jsonwebtoken_1.default.verify(access_token, config_1.SECRET_JWT_KEY);
            if (typeof data === "object" && data !== null) {
                const user = data; // Casting si estás seguro que data contiene propiedades de User
                if (user.id == userid) {
                    access = true;
                }
            }
        }
        if (access) {
            const searchWords = idcode.split(" ").map((word) => word.toLowerCase());
            const whereConditions = {
                [sequelize_1.Op.and]: searchWords.map((word) => ({
                    code: { [sequelize_1.Op.like]: `%${word}%` },
                })),
            };
            if (userid != undefined && userid != null && userid != "") {
                whereConditions[sequelize_1.Op.and].push({ userID: userid });
            }
            const ordersAux = yield Orders_1.default.findAll({ where: whereConditions });
            if (ordersAux) {
                res.json(ordersAux);
            }
            else {
                res.status(404).json({ message: "Error, orders not found" });
            }
        }
        else {
            res.send("No se puede acceder a los pedidos de otros usuarios");
        }
    }
    else {
        res.send("Ruta protegida");
    }
});
exports.searchOrders = searchOrders;
const getOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const OrderAux = yield Orders_1.default.findByPk(id);
    if (OrderAux) {
        res.json(OrderAux);
    }
    else {
        res.status(404).json({ message: "Error, Order not found" });
    }
});
exports.getOrder = getOrder;
const deleteOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const admin_token = req.cookies.admin_token;
    const access_token = req.cookies.access_token;
    if (access_token && admin_token) {
        if (verifyAdmin(admin_token)) {
            const { id } = req.params;
            const OrderAux = yield Orders_1.default.findByPk(`${id}`);
            if (OrderAux) {
                yield OrderAux.destroy();
                res.json({ message: "Order successfully deleted" });
            }
            else {
                res.status(404).json({ message: "Error, Order not found" });
            }
        }
        else {
            res.send("Ruta protegida");
        }
    }
    else {
        res.send("Ruta protegida");
    }
});
exports.deleteOrder = deleteOrder;
const sendEmail = (to, subject, text) => __awaiter(void 0, void 0, void 0, function* () {
    let transporter = nodemailer_1.default.createTransport({
        service: "Gmail", // Puedes usar otro servicio como 'Yahoo', 'Outlook', etc.
        auth: {
            user: "info.losvascosdistribucion@gmail.com",
            pass: "yqht mimi ohlw kobp",
        },
    });
    let mailOptions = {
        from: "info.losvascosdistribucion@gmail.com", // Remitente
        to: to, // Destinatario
        subject: subject, // Asunto
        html: text, // Cuerpo del correo en texto plano
        ///html: html // Cuerpo del correo en formato HTML (opcional)
    };
    try {
        let info = yield transporter.sendMail(mailOptions);
    }
    catch (error) {
        console.error("Error al enviar el correo: ", error);
    }
});
exports.sendEmail = sendEmail;
const postOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const access_token = req.cookies.access_token;
    if (access_token) {
        const { order, to, subject, html, htmlAux } = req.body;
        yield Orders_1.default.create(order);
        yield (0, exports.sendEmail)(to, subject, html);
        let toAux = "info.losvascosdistribucion@gmail.com";
        yield (0, exports.sendEmail)(toAux, subject, htmlAux);
        res.json({
            message: "Order successfully created",
        });
    }
    else {
        res.send("No podes comprar sin haber iniciado sesion");
    }
});
exports.postOrder = postOrder;
const updateOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const { id } = req.params;
    const OrderAux = yield Orders_1.default.findByPk(id);
    if (OrderAux) {
        OrderAux.update(body);
        res.json({
            message: "Order updated with success",
        });
    }
    else {
        res.status(404).json({ message: "Error, Order not found" });
    }
});
exports.updateOrder = updateOrder;
const deleteOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const admin_token = req.cookies.admin_token;
    const access_token = req.cookies.access_token;
    if (access_token && admin_token) {
        if (verifyAdmin(admin_token)) {
            yield Orders_1.default.destroy({ truncate: true });
        }
        else {
            res.send("Ruta protegida");
        }
    }
    else {
        res.send("Acceso denegado");
    }
});
exports.deleteOrders = deleteOrders;
const verifyAdmin = (adminToken) => {
    if (adminToken) {
        const dataAdmin = jsonwebtoken_1.default.verify(adminToken, config_1.SECRET_JWT_KEY);
        if (typeof dataAdmin === "object" && dataAdmin !== null) {
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
    }
};
