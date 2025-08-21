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
exports.deleteSubcategoriesByName = exports.deleteCategories = exports.updateCategory = exports.postCategory = exports.deleteCategory = exports.getCategory = exports.getSubcategoriesByCategory = exports.getSubcategories = void 0;
const config_1 = require("../models/config");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_2 = require("../models/config");
const Subcategory_1 = __importDefault(require("../models/mysql/Subcategory"));
const sequelize_1 = require("sequelize");
const getSubcategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const listFeatures = yield Subcategory_1.default.findAll();
    res.json(listFeatures);
});
exports.getSubcategories = getSubcategories;
const getSubcategoriesByCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { categoryID } = req.params;
    if (categoryID) {
        const listFeatures = yield Subcategory_1.default.findAll({
            where: { categoryID: categoryID },
        });
        res.json(listFeatures);
    }
});
exports.getSubcategoriesByCategory = getSubcategoriesByCategory;
const getCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const CategoryAux = yield Subcategory_1.default.findByPk(id);
    if (CategoryAux) {
        res.json(CategoryAux);
    }
    else {
        res.status(404).json({ message: "Error, Category not found" });
    }
});
exports.getCategory = getCategory;
const deleteCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const access_token = req.cookies.access_token;
    const admin_token = req.cookies.admin_token;
    if (access_token && admin_token) {
        if (verifyAdmin(admin_token)) {
            const { id } = req.params;
            const CategoryAux = yield Subcategory_1.default.findByPk(`${id}`);
            if (CategoryAux) {
                yield Subcategory_1.default.destroy();
                res.json({ message: "Category successfully deleted" });
            }
            else {
                res.status(404).json({ message: "Error, Category not found" });
            }
        }
        else {
            res.send("Ruta protegida");
        }
    }
    else {
        res.send("Permiso denegado");
    }
});
exports.deleteCategory = deleteCategory;
const postCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const access_token = req.cookies.access_token;
    const admin_token = req.cookies.admin_token;
    if (access_token && admin_token) {
        if (verifyAdmin(admin_token)) {
            let body = req.body;
            const subCategory = {
                id: body.id,
                name: body.name,
                categoryID: body.categoryID,
            };
            yield Subcategory_1.default.create(subCategory);
            res.json({
                message: "Category successfully created",
            });
        }
        else {
            res.send("Ruta protegida");
        }
    }
    else {
        res.send("Permiso denegado");
    }
});
exports.postCategory = postCategory;
const updateCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const { id } = req.params;
    const CategoryAux = yield Subcategory_1.default.findByPk(id);
    if (CategoryAux) {
        CategoryAux.update(body);
        res.json({
            message: "Categories updated",
        });
    }
    else {
        res.status(404).json({ message: "Error, Category not found" });
    }
});
exports.updateCategory = updateCategory;
const deleteCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const access_token = req.cookies.access_token;
    const admin_token = req.cookies.admin_token;
    if (access_token && admin_token) {
        if (verifyAdmin(admin_token)) {
            yield Subcategory_1.default.destroy({ truncate: true });
        }
        else {
            res.send("Ruta protegida");
        }
    }
    else {
        res.send("Permiso denegado");
    }
});
exports.deleteCategories = deleteCategories;
const deleteSubcategoriesByName = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const access_token = req.cookies.access_token;
    const admin_token = req.cookies.admin_token;
    const { name } = req.params;
    if (access_token && admin_token) {
        if (verifyAdmin(admin_token)) {
            yield Subcategory_1.default.destroy({
                where: {
                    name: { [sequelize_1.Op.like]: `%${name}%` }, // Busca si el nombre contiene "name"
                },
            });
        }
        else {
            res.send("Ruta protegida");
        }
    }
    else {
        res.send("Permiso denegado");
    }
});
exports.deleteSubcategoriesByName = deleteSubcategoriesByName;
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
