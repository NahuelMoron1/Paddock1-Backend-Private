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
exports.deleteOptions = exports.updateOption = exports.postOption = exports.deleteOption = exports.deleteOptionByProduct = exports.getProductOptionsByName = exports.getProductOptionsByTwo = exports.getProductOptions = exports.getOption = exports.getOptions = void 0;
const Options_1 = __importDefault(require("../models/mysql/Options"));
const config_1 = require("../models/config");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_2 = require("../models/config");
const getOptions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let tokenAux = req.cookies.admin_token;
    let access = req.cookies.access_token;
    if (access && tokenAux) {
        if (verifyAdmin(tokenAux)) {
            const listOptions = yield Options_1.default.findAll();
            res.json(listOptions);
        }
        else {
            res.send("Ruta protegida");
        }
    }
    else {
        res.send("Ruta protegida");
    }
});
exports.getOptions = getOptions;
const getOption = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const OptionAux = yield Options_1.default.findByPk(id);
    if (OptionAux) {
        res.json(OptionAux);
    }
    else {
        res.status(404).json({ message: "Error, Option not found" });
    }
});
exports.getOption = getOption;
const getProductOptions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { productID } = req.params;
    const OptionAux = yield Options_1.default.findAll({ where: { productID: productID } });
    if (OptionAux) {
        res.json(OptionAux);
    }
    else {
        res.status(404).json({ message: "Error, Options not found" });
    }
});
exports.getProductOptions = getProductOptions;
const getProductOptionsByTwo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { productID } = req.params;
    const { optionName } = req.params;
    const optionValid = decodeURIComponent(optionName);
    const OptionAux = yield Options_1.default.findOne({
        where: { name: optionValid, productID: productID },
    });
    if (OptionAux) {
        res.json(OptionAux);
    }
    else {
        res.status(404).json({ message: "Error, Options not found" });
    }
});
exports.getProductOptionsByTwo = getProductOptionsByTwo;
const getProductOptionsByName = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, productid } = req.params;
    const decoded = encodeURIComponent(name); /// TO CHECK
    const OptionAux = yield Options_1.default.findOne({
        where: { name: decoded, productID: productid },
    });
    if (OptionAux) {
        res.json(OptionAux);
    }
    else {
        res.status(404).json({ message: "Error, Options not found" });
    }
});
exports.getProductOptionsByName = getProductOptionsByName;
const deleteOptionByProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let tokenAux = req.cookies.admin_token;
    let access = req.cookies.access_token;
    if (access && tokenAux) {
        if (verifyAdmin(tokenAux)) {
            const { id } = req.params;
            const OptionAux = yield Options_1.default.findAll({ where: { productID: id } });
            if (OptionAux) {
                if (OptionAux.length > 0) {
                    if (OptionAux.length < 2) {
                        yield OptionAux[0].destroy();
                    }
                    else {
                        for (let i = 0; i < OptionAux.length; i++) {
                            yield OptionAux[i].destroy();
                        }
                    }
                    res.json({ message: "Options successfully deleted" });
                }
            }
            else {
                res.status(404).json({ message: "Error, Options not found" });
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
exports.deleteOptionByProduct = deleteOptionByProduct;
const deleteOption = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let tokenAux = req.cookies.admin_token;
    let access = req.cookies.access_token;
    if (access && tokenAux) {
        if (verifyAdmin(tokenAux)) {
            const { id } = req.params;
            const OptionAux = yield Options_1.default.findByPk(`${id}`);
            if (OptionAux) {
                yield OptionAux.destroy();
                res.json({ message: "Option successfully deleted" });
            }
            else {
                res.status(404).json({ message: "Error, Option not found" });
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
exports.deleteOption = deleteOption;
const postOption = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let tokenAux = req.cookies.admin_token;
    let access = req.cookies.access_token;
    if (access && tokenAux) {
        if (verifyAdmin(tokenAux)) {
            const body = req.body;
            yield Options_1.default.create(body);
            res.json({
                message: "Option successfully created",
            });
        }
        else {
            res.send("Ruta protegida");
        }
    }
    else {
        res.send("Ruta protegida");
    }
});
exports.postOption = postOption;
const updateOption = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const { oldID } = req.params;
    const OptionAux = yield Options_1.default.findByPk(oldID);
    if (OptionAux) {
        let varaux = yield Options_1.default.update({
            id: body.id,
            name: body.name,
            productID: body.productID,
            stock: body.stock,
            price: body.price,
        }, { where: { id: oldID } });
        res.json({
            message: "Option updated",
        });
    }
    else {
        res.status(404).json({ message: "Error, Option not found" });
    }
});
exports.updateOption = updateOption;
const deleteOptions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let tokenAux = req.cookies.admin_token;
    let access = req.cookies.access_token;
    if (access && tokenAux) {
        if (verifyAdmin(tokenAux)) {
            yield Options_1.default.destroy({ truncate: true });
        }
        else {
            res.send("Ruta protegida");
        }
    }
    else {
        res.send("Ruta protegida");
    }
});
exports.deleteOptions = deleteOptions;
const verifyAdmin = (adminToken) => {
    const dataAdmin = jsonwebtoken_1.default.verify(adminToken, config_2.SECRET_JWT_KEY);
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
        return access;
    }
    else {
        return false;
    }
};
