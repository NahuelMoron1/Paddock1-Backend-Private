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
exports.deleteOrdersXproducts = exports.updateOrderXproducts = exports.postOrderXproducts = exports.deleteOrderXproductsByIDs = exports.deleteOrderXproducts = exports.getOxpByOrders = exports.getOrderXproducts = exports.getOrdersXproducts = void 0;
const orderXproducts_1 = require("../models/mysql/orderXproducts");
const config_1 = require("../models/config");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_2 = require("../models/config");
const getOrdersXproducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let tokenAux = req.cookies.admin_token;
    let access = req.cookies.access_token;
    if (access && tokenAux) {
        if (verifyAdmin(tokenAux)) {
            const listOrders = yield orderXproducts_1.OrderXproducts.findAll();
            res.json(listOrders);
        }
        else {
            res.send('Ruta protegida');
        }
    }
    else {
        res.send('Ruta protegida');
    }
});
exports.getOrdersXproducts = getOrdersXproducts;
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
const getOrderXproducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    let access = req.cookies.access_token;
    if (access) {
        try {
            const data = jsonwebtoken_1.default.verify(access, config_2.SECRET_JWT_KEY);
            if (typeof data === 'object' && data !== null) {
                const user = data; // Casting si estás seguro que data contiene propiedades de User
                if (user.id == id || verifyAdmin(access)) {
                    const OrderAux = yield orderXproducts_1.OrderXproducts.findByPk(id);
                    if (OrderAux) {
                        res.json(OrderAux);
                    }
                    else {
                        res.status(404).json({ message: 'Error, OrderXproducts not found' });
                    }
                }
                else {
                    res.send('Ruta protegida');
                }
            }
            else {
                res.send('Ruta protegida');
            }
        }
        catch (error) {
            res.send('Ruta protegida');
        }
    }
});
exports.getOrderXproducts = getOrderXproducts;
const getOxpByOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { orderid } = req.params;
    const ordersAux = yield orderXproducts_1.OrderXproducts.findAll({ where: { orderId: orderid } });
    if (ordersAux) {
        res.json(ordersAux);
    }
    else {
        res.status(404).json({ message: 'Error, orders not found' });
    }
});
exports.getOxpByOrders = getOxpByOrders;
const deleteOrderXproducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let tokenAux = req.cookies.admin_token;
    let access = req.cookies.access_token;
    if (access && tokenAux) {
        if (verifyAdmin(tokenAux)) {
            const { id } = req.params;
            const OrderAux = yield orderXproducts_1.OrderXproducts.findByPk(`${id}`);
            if (OrderAux) {
                yield OrderAux.destroy();
                res.json({ message: 'OrderXproducts successfully deleted' });
            }
            else {
                res.status(404).json({ message: 'Error, Order not found' });
            }
        }
    }
});
exports.deleteOrderXproducts = deleteOrderXproducts;
const deleteOrderXproductsByIDs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let tokenAux = req.cookies.admin_token;
    let access = req.cookies.access_token;
    if (access && tokenAux) {
        if (verifyAdmin(tokenAux)) {
            const { productID } = req.params;
            const { orderID } = req.params;
            const OrderAux = yield orderXproducts_1.OrderXproducts.findOne({
                where: {
                    productId: productID,
                    orderId: orderID
                }
            });
            if (OrderAux) {
                yield OrderAux.destroy();
                res.json({ message: 'OrderXproducts successfully deleted' });
            }
            else {
                res.status(404).json({ message: 'Error, Order not found' });
            }
        }
    }
});
exports.deleteOrderXproductsByIDs = deleteOrderXproductsByIDs;
const postOrderXproducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let access = req.cookies.access_token;
    const body = req.body;
    if (access) {
        yield orderXproducts_1.OrderXproducts.create(body);
        res.json({
            message: 'OrderXproducts successfully created',
        });
    }
});
exports.postOrderXproducts = postOrderXproducts;
const updateOrderXproducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const { id } = req.params;
    const OrderAux = yield orderXproducts_1.OrderXproducts.findByPk(id);
    if (OrderAux) {
        OrderAux.update(body);
        res.json({
            message: 'OrderXproducts updated with success',
        });
    }
    else {
        res.status(404).json({ message: 'Error, OrderXproducts not found' });
    }
});
exports.updateOrderXproducts = updateOrderXproducts;
const deleteOrdersXproducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let tokenAux = req.cookies.admin_token;
    let access = req.cookies.access_token;
    if (access && tokenAux) {
        if (verifyAdmin(tokenAux)) {
            yield orderXproducts_1.OrderXproducts.destroy({ truncate: true });
        }
    }
});
exports.deleteOrdersXproducts = deleteOrdersXproducts;
