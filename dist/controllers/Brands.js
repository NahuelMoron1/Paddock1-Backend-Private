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
exports.postImage = exports.deleteBrands = exports.updateBrand = exports.postBrands = exports.deleteBrand = exports.getBrand = exports.getBrands = void 0;
const Brands_1 = __importDefault(require("../models/mysql/Brands"));
const connection_1 = __importDefault(require("../db/connection"));
const config_1 = require("../models/config");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_2 = require("../models/config");
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const fs_1 = __importDefault(require("fs"));
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const getBrands = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const listBrands = yield Brands_1.default.findAll({
        order: [
            // Primero ponemos las marcas cuyo nombre es 'Tel'
            [connection_1.default.literal(`CASE WHEN name = 'Tel' THEN 0 ELSE 1 END`), "ASC"],
            // Luego ordenamos las demás marcas en orden descendente por name
            ["name", "DESC"],
        ],
    });
    res.json(listBrands);
});
exports.getBrands = getBrands;
const getBrand = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const BrandAux = yield Brands_1.default.findByPk(id);
    if (BrandAux) {
        res.json(BrandAux);
    }
    else {
        res.status(404).json({ message: "Error, Brand not found" });
    }
});
exports.getBrand = getBrand;
const deleteBrand = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const access_token = req.cookies.access_token;
    const admin_token = req.cookies.admin_token;
    if (access_token && admin_token) {
        if (verifyAdmin(admin_token)) {
            const { id } = req.params;
            const BrandAux = yield Brands_1.default.findByPk(`${id}`);
            if (BrandAux) {
                yield BrandAux.destroy();
                res.json({ message: "Brand successfully deleted" });
            }
            else {
                res.status(404).json({ message: "Error, Brand not found" });
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
exports.deleteBrand = deleteBrand;
const postBrands = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const access_token = req.cookies.access_token;
    const admin_token = req.cookies.admin_token;
    if (access_token && admin_token) {
        if (verifyAdmin(admin_token)) {
            const body = JSON.parse(req.body.brand);
            const removeBackgroundFilter = JSON.parse(req.body.removeBackground);
            const file = req.file;
            if (!file) {
                return res.status(500).json({
                    message: "Error, you missed to complete all required fields",
                });
            }
            let imageWithoutBg;
            if (removeBackgroundFilter) {
                imageWithoutBg = yield removeBackground(file);
                if (!imageWithoutBg) {
                    return res.status(500).json({
                        message: "Error removing background from the image",
                    });
                }
            }
            const imageUrl = imageWithoutBg
                ? (0, exports.postImage)(imageWithoutBg, file.originalname)
                : (0, exports.postImage)(file);
            if (imageUrl) {
                body.image = imageUrl;
                yield Brands_1.default.create(body);
                res.json({
                    message: "Brand successfully created",
                });
            }
            else {
                res.json({ message: "Not all fields contains a value" });
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
exports.postBrands = postBrands;
const updateBrand = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const { id } = req.params;
    const BrandsAux = yield Brands_1.default.findByPk(id);
    if (BrandsAux) {
        BrandsAux.update(body);
        res.json({
            message: "Brand updated with success",
        });
    }
    else {
        res.status(404).json({ message: "Error, Brand not found" });
    }
});
exports.updateBrand = updateBrand;
const deleteBrands = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const access_token = req.cookies.access_token;
    const admin_token = req.cookies.admin_token;
    if (access_token && admin_token) {
        if (verifyAdmin(admin_token)) {
            yield Brands_1.default.destroy({ truncate: true });
        }
    }
    else {
        res.send("Permiso denegado");
    }
});
exports.deleteBrands = deleteBrands;
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
const postImage = (file, originalName) => {
    if (!file)
        return undefined;
    const uniqueName = `${(0, uuid_1.v4)()}${path_1.default.extname(originalName || "image.png")}`;
    const uploadPath = path_1.default.join("uploads/brands", uniqueName);
    // 🔹 Si `file` es un Buffer (imagen procesada), lo guarda como un archivo
    if (file instanceof Buffer) {
        fs_1.default.writeFileSync(uploadPath, file);
    }
    else {
        // 🔹 Si es un archivo Multer, guarda el buffer
        fs_1.default.writeFileSync(uploadPath, file.buffer);
    }
    return uploadPath;
};
exports.postImage = postImage;
function removeBackground(file) {
    return __awaiter(this, void 0, void 0, function* () {
        const REMOVE_BG_API_KEY = "8h7vtT5EomgjNXiSFm4xQGWs"; // Reemplázala con tu API key
        const formData = new form_data_1.default();
        formData.append("image_file", file.buffer, { filename: file.originalname });
        formData.append("size", "auto");
        try {
            const response = yield axios_1.default.post("https://api.remove.bg/v1.0/removebg", formData, {
                headers: Object.assign({ "X-Api-Key": REMOVE_BG_API_KEY }, formData.getHeaders()),
                responseType: "arraybuffer", // Devuelve la imagen en binario
            });
            return Buffer.from(response.data); // Retorna la imagen procesada como buffer
        }
        catch (error) {
            console.error("Error removiendo el fondo:", error);
            return null;
        }
    });
}
