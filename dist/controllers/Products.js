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
exports.postImage = exports.deleteProducts = exports.updateProduct = exports.postProduct = exports.deleteProduct = exports.getProductsBySearch = exports.getProductsByCategory = exports.getRandomProducts = exports.getProductsByBrands = exports.productExists = exports.getProductsByParams = exports.getProduct = exports.countPages = exports.getProducts = void 0;
const Products_1 = __importDefault(require("../models/mysql/Products"));
const sequelize_1 = require("sequelize");
const config_1 = require("../models/config");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_2 = require("../models/config");
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const fs_1 = __importDefault(require("fs"));
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const getProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { page } = req.params;
    const pageNumb = parseInt(page);
    const pageSize = 12; //Cantidad de elementos por pagina
    const totalProducts = yield Products_1.default.count(); // Obtener el total de productos
    const totalPages = totalProducts / pageSize;
    // Si la página solicitada supera el número máximo de páginas, ajustarla a la última página
    const validPageNumb = pageNumb > totalPages ? totalPages : pageNumb;
    const offset = (validPageNumb - 1) * pageSize;
    const listProducts = yield Products_1.default.findAll({
    //limit: pageSize,
    //offset: offset,
    /*order: [
            [sequelize.literal(`(brand = 'Tel')`), 'DESC'],  // Priorizar los productos de marca 'Tel'
            ['category', 'ASC'],                             // Luego ordenar por categoría
            ['stock', 'ASC'],                                // Después ordenar por stock
            ['brand', 'ASC']                                 // Finalmente ordenar alfabéticamente por marca
        ]*/
    });
    res.json(listProducts);
});
exports.getProducts = getProducts;
const countPages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { brand } = req.params;
    const { type } = req.params;
    const pageSize = 12; //Cantidad de elementos por pagina
    let totalProducts = 0;
    if (type == "all") {
        totalProducts = yield Products_1.default.count(); // Obtener el total de productos
    }
    else {
        if (type == "brand") {
            totalProducts = yield Products_1.default.count({ where: { brand: brand } }); // Obtener el total de productos
        }
        else {
            totalProducts = yield Products_1.default.count({ where: { category: brand } }); // Obtener el total de productos
        }
    }
    const totalPages = totalProducts / pageSize;
    res.json(Math.ceil(totalPages));
});
exports.countPages = countPages;
const getProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const productAux = yield Products_1.default.findByPk(id);
    if (productAux) {
        res.json(productAux);
    }
    else {
        res.status(404).json({ message: "Error, Product not found" });
    }
});
exports.getProduct = getProduct;
const getProductsByParams = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { category } = req.params;
    const { subcategory } = req.params;
    const { brand } = req.params;
    const { type } = req.params;
    let productsAux;
    switch (type) {
        case "brand-category":
            productsAux = yield Products_1.default.findAll({
                where: { brand: brand, category: category },
            });
            break;
        case "brand-subcategory":
            productsAux = yield Products_1.default.findAll({
                where: { brand: brand, category: category, subcategory: subcategory },
            });
            break;
        case "subcategory":
            productsAux = yield Products_1.default.findAll({
                where: { category: category, subcategory: subcategory },
            });
            break;
    }
    if (productsAux) {
        res.json(productsAux);
    }
    else {
        res.status(404).json({ message: "Error, Products not found" });
    }
});
exports.getProductsByParams = getProductsByParams;
const productExists = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const product = req.body;
    const productAux = yield Products_1.default.findByPk(product.latestID);
    if (productAux) {
        res.json(true);
    }
    else {
        res.json(false);
    }
});
exports.productExists = productExists;
const getProductsByBrands = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { brand } = req.params;
    const { page } = req.params;
    const pageNumb = parseInt(page);
    const pageSize = 12; //Cantidad de elementos por pagina
    const totalProducts = yield Products_1.default.count(); // Obtener el total de productos
    const totalPages = Math.ceil(totalProducts / pageSize);
    // Si la página solicitada supera el número máximo de páginas, ajustarla a la última página
    const validPageNumb = pageNumb > totalPages ? totalPages : pageNumb;
    const offset = (validPageNumb - 1) * pageSize;
    const productsAux = yield Products_1.default.findAll({
        where: { brand: brand },
        limit: pageSize,
        offset: offset,
        order: [
            ["category", "ASC"], // Ordenar por `category` en orden ascendente
        ],
    });
    if (productsAux) {
        res.json(productsAux);
    }
    else {
        res.status(404).json({ message: "Error, product not found" });
    }
});
exports.getProductsByBrands = getProductsByBrands;
const getRandomProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const products = yield Products_1.default.findAll({
        order: [sequelize_1.Sequelize.literal("RAND()")],
        limit: 3,
    });
    /*await Products.sequelize?.query(
      `SELECT * FROM Products WHERE brand = 'Tel' ORDER BY RAND() LIMIT 3`,
      {
        type: QueryTypes.SELECT,
      }
    );*/
    if (products) {
        res.json(products);
    }
    else {
        res.status(404).json({ message: "Error, product not found" });
    }
});
exports.getRandomProducts = getRandomProducts;
const getProductsByCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { category } = req.params;
    const { page } = req.params;
    const pageNumb = parseInt(page);
    const pageSize = 12; //Cantidad de elementos por pagina
    const totalProducts = yield Products_1.default.count(); // Obtener el total de productos
    const totalPages = Math.ceil(totalProducts / pageSize);
    // Si la página solicitada supera el número máximo de páginas, ajustarla a la última página
    const validPageNumb = pageNumb > totalPages ? totalPages : pageNumb;
    const offset = (validPageNumb - 1) * pageSize;
    const productsAux = yield Products_1.default.findAll({
        where: { category: category },
        limit: pageSize,
        offset: offset,
        order: [
            ["category", "ASC"], // Ordenar por `category` en orden ascendente
        ],
    });
    if (productsAux) {
        res.json(productsAux);
    }
    else {
        res.status(404).json({ message: "Error, product not found" });
    }
});
exports.getProductsByCategory = getProductsByCategory;
const getProductsBySearch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, value, type } = req.params;
    const searchWords = name.split(" ").map((word) => word.toLowerCase());
    const whereConditions = {
        [sequelize_1.Op.and]: searchWords.map((word) => ({
            name: { [sequelize_1.Op.like]: `%${word}%` },
        })),
    };
    // Agregar la condición de brand si no es 'all'
    if (value !== "" && value != "all") {
        if (type == "brand") {
            whereConditions[sequelize_1.Op.and].push({ brand: value });
        }
        else if (type == "category") {
            whereConditions[sequelize_1.Op.and].push({ category: value });
        }
    }
    // Construimos la consulta para buscar todas las palabras
    const productsAux = yield Products_1.default.findAll({
        where: whereConditions,
        order: [
            ["category", "ASC"], // Ordenar por `category` en orden ascendente
            ["name", "ASC"], // Ordenar por `name` en orden ascendente
        ],
    });
    if (productsAux) {
        res.json(productsAux);
    }
    else {
        res.status(404).json({ message: "Error, product not found" });
    }
});
exports.getProductsBySearch = getProductsBySearch;
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const admin_token = req.cookies.admin_token;
    const access_token = req.cookies.access_token;
    if (access_token && admin_token) {
        if (verifyAdmin(admin_token)) {
            const { id } = req.params;
            const productAux = yield Products_1.default.findByPk(`${id}`);
            if (productAux) {
                yield productAux.destroy();
                res.json({ message: "Product successfully deleted" });
            }
            else {
                res.status(404).json({ message: "Error, product not found" });
            }
        }
    }
    else {
        res.send("Permiso denegado");
    }
});
exports.deleteProduct = deleteProduct;
const REMOVE_BG_API_KEY = "8h7vtT5EomgjNXiSFm4xQGWs"; // Reemplázala con tu API key
function removeBackground(file) {
    return __awaiter(this, void 0, void 0, function* () {
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
const postProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const admin_token = req.cookies.admin_token;
    const access_token = req.cookies.access_token;
    if (admin_token && access_token) {
        if (verifyAdmin(admin_token)) {
            let product = JSON.parse(req.body.product);
            const file = req.file;
            if (productValidated(product)) {
                if (!file) {
                    return res.status(500).json({
                        message: "Error, you missed to complete all required fields",
                    });
                }
                const imageWithoutBg = yield removeBackground(file);
                if (!imageWithoutBg) {
                    return res.status(500).json({
                        message: "Error removing background from the image",
                    });
                }
                const imageUrl = imageWithoutBg
                    ? (0, exports.postImage)(imageWithoutBg, file.originalname)
                    : (0, exports.postImage)(file);
                if (imageUrl !== undefined) {
                    product.image = imageUrl;
                    yield Products_1.default.create(product);
                    res.json({
                        message: "Product successfully created",
                    });
                }
                else {
                    return res.status(500).json({
                        message: "Error, the image you upload wasn't uploaded well",
                    });
                }
            }
        }
    }
    else {
        res.send("Permiso denegado");
    }
});
exports.postProduct = postProduct;
const updateProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const { id } = req.params;
    const productAux = yield Products_1.default.findByPk(id);
    if (productAux) {
        productAux.update(body);
        res.json({
            message: "Product updated with success",
        });
    }
    else {
        res.status(404).json({ message: "Error, product not found" });
    }
});
exports.updateProduct = updateProduct;
const deleteProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const access_token = req.cookies.access_token;
    const admin_token = req.cookies.admin_token;
    if (access_token && admin_token) {
        if (verifyAdmin(admin_token)) {
            yield Products_1.default.destroy({ truncate: true });
        }
    }
    else {
        res.send("Permiso denegado");
    }
});
exports.deleteProducts = deleteProducts;
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
const productValidated = (product) => {
    if (!product.id ||
        !product.name ||
        !product.category ||
        !product.brand ||
        !product.quantity ||
        !product.description) {
        return false;
    }
    return true;
};
const postImage = (file, originalName) => {
    if (!file)
        return undefined;
    const uniqueName = `${(0, uuid_1.v4)()}${path_1.default.extname(originalName || "image.png")}`;
    const uploadPath = path_1.default.join("uploads/products", uniqueName);
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
