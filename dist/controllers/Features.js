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
exports.deleteFeatures = exports.updateFeature = exports.postFeature = exports.deleteFeature = exports.getProductFeatures = exports.getFeature = exports.getFeatures = void 0;
const Features_1 = __importDefault(require("../models/mysql/Features"));
const config_1 = require("../models/config");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_2 = require("../models/config");
const getFeatures = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const access_token = req.cookies.access_token;
    const admin_token = req.cookies.admin_token;
    if (access_token && admin_token) {
        if (verifyAdmin(admin_token)) {
            const listFeatures = yield Features_1.default.findAll();
            res.json(listFeatures);
        }
        else {
            res.send('Ruta protegida');
        }
    }
    else {
        res.send('Ruta protegida');
    }
});
exports.getFeatures = getFeatures;
const getFeature = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const FeatureAux = yield Features_1.default.findByPk(id);
    if (FeatureAux) {
        res.json(FeatureAux);
    }
    else {
        res.status(404).json({ message: 'Error, Feature not found' });
    }
});
exports.getFeature = getFeature;
const getProductFeatures = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { productID } = req.params;
    const FeatureAux = yield Features_1.default.findAll({ where: { product_id: productID } });
    if (FeatureAux) {
        res.json(FeatureAux);
    }
    else {
        res.status(404).json({ message: 'Error, Features not found' });
    }
});
exports.getProductFeatures = getProductFeatures;
const deleteFeature = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const access_token = req.cookies.access_token;
    const admin_token = req.cookies.admin_token;
    if (access_token && admin_token) {
        if (verifyAdmin(admin_token)) {
            const { id } = req.params;
            const FeatureAux = yield Features_1.default.findByPk(`${id}`);
            if (FeatureAux) {
                yield FeatureAux.destroy();
                res.json({ message: 'Feature successfully deleted' });
            }
            else {
                res.status(404).json({ message: 'Error, Feature not found' });
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
exports.deleteFeature = deleteFeature;
const postFeature = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const access_token = req.cookies.access_token;
    const admin_token = req.cookies.admin_token;
    if (access_token && admin_token) {
        if (verifyAdmin(admin_token)) {
            const body = req.body;
            yield Features_1.default.create(body);
            res.json({
                message: 'Feature successfully created',
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
exports.postFeature = postFeature;
const updateFeature = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const { id } = req.params;
    const FeatureAux = yield Features_1.default.findByPk(id);
    if (FeatureAux) {
        FeatureAux.update(body);
        res.json({
            message: 'Feature updated',
        });
    }
    else {
        res.status(404).json({ message: 'Error, Feature not found' });
    }
});
exports.updateFeature = updateFeature;
const deleteFeatures = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const access_token = req.cookies.access_token;
    const admin_token = req.cookies.admin_token;
    if (access_token && admin_token) {
        if (verifyAdmin(admin_token)) {
            yield Features_1.default.destroy({ truncate: true });
        }
        else {
            res.send('Ruta protegida');
        }
    }
    else {
        res.send('Ruta protegida');
    }
});
exports.deleteFeatures = deleteFeatures;
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
