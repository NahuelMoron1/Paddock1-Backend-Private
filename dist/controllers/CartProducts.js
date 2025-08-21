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
exports.deleteCartProducts = exports.updateCartProduct = exports.postCartProduct = exports.deleteCartProduct = exports.getCartProductsByOrder = exports.getCartProduct = exports.getCartProducts = void 0;
const CartProduct_1 = __importDefault(require("../models/mysql/CartProduct"));
const config_1 = require("../models/config");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_2 = require("../models/config");
const getCartProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const access_token = req.cookies.access_token;
    const admin_token = req.cookies.admin_token;
    if (access_token && admin_token) {
        if (verifyAdmin(admin_token)) {
            const listProducts = yield CartProduct_1.default.findAll();
            res.json(listProducts);
        }
        else {
            res.send('Ruta protegida');
        }
    }
    else {
        res.send('Ruta protegida');
    }
});
exports.getCartProducts = getCartProducts;
const getCartProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const productAux = yield CartProduct_1.default.findByPk(id);
    if (productAux) {
        res.json(productAux);
    }
    else {
        res.status(404).json({ message: 'Error, CartProduct not found' });
    }
});
exports.getCartProduct = getCartProduct;
const getCartProductsByOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { orderID } = req.params;
    const productsAux = yield CartProduct_1.default.findAll({ where: { orderID: orderID } });
    if (productsAux) {
        res.json(productsAux);
    }
    else {
        res.status(404).json({ message: 'Error, CartProduct not found' });
    }
});
exports.getCartProductsByOrder = getCartProductsByOrder;
const deleteCartProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const access_token = req.cookies.access_token;
    const admin_token = req.cookies.admin_token;
    if (access_token && admin_token) {
        if (verifyAdmin(admin_token)) {
            const { id } = req.params;
            const productAux = yield CartProduct_1.default.findByPk(`${id}`);
            if (productAux) {
                yield productAux.destroy();
                res.json({ message: 'CartProduct successfully deleted' });
            }
            else {
                res.status(404).json({ message: 'Error, Cartproduct not found' });
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
exports.deleteCartProduct = deleteCartProduct;
const postCartProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const access_token = req.cookies.access_token;
    if (access_token) {
        const body = req.body;
        yield CartProduct_1.default.create(body);
        res.json({
            message: 'CartProduct successfully created',
        });
    }
});
exports.postCartProduct = postCartProduct;
const updateCartProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const { id } = req.params;
    const productAux = yield CartProduct_1.default.findByPk(id);
    if (productAux) {
        productAux.update(body);
        res.json({
            message: 'CartProduct updated with success',
        });
    }
    else {
        res.status(404).json({ message: 'Error, Cartproduct not found' });
    }
});
exports.updateCartProduct = updateCartProduct;
const deleteCartProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const access_token = req.cookies.access_token;
    const admin_token = req.cookies.admin_token;
    if (access_token && admin_token) {
        if (verifyAdmin(admin_token)) {
            yield CartProduct_1.default.destroy({ truncate: true });
        }
        else {
            res.send('Ruta protegida');
        }
    }
    else {
        res.send('Ruta protegida');
    }
});
exports.deleteCartProducts = deleteCartProducts;
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
        return access;
    }
    else {
        return false;
    }
};
