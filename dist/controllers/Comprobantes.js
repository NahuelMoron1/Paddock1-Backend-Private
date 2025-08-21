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
exports.deleteComprobantes = exports.updateComprobantes = exports.deleteComprobante = exports.getComprobante = exports.getComprobantes = void 0;
const Comprobantes_1 = __importDefault(require("../models/mysql/Comprobantes"));
const getComprobantes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const listProducts = yield Comprobantes_1.default.findAll();
    res.json(listProducts);
});
exports.getComprobantes = getComprobantes;
const getComprobante = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const comprobante = yield Comprobantes_1.default.findByPk(id);
        if (!comprobante) {
            return res.status(404).send('Comprobante not found');
        }
        // Devolver el archivo como respuesta
        res.set('Content-Type', 'application/octet-stream'); // Tipo de contenido del archivo
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving comprobante file');
    }
});
exports.getComprobante = getComprobante;
const deleteComprobante = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const productAux = yield Comprobantes_1.default.findByPk(`${id}`);
    if (productAux) {
        yield productAux.destroy();
        res.json({ message: 'Product successfully deleted' });
    }
    else {
        res.status(404).json({ message: 'Error, product not found' });
    }
});
exports.deleteComprobante = deleteComprobante;
/*export const postComprobante = async(req: Request, res: Response) => {
    if (!req.files || !req.body) {
        return res.status(400).send('No files or data were uploaded.');
      }
    
      const { id, orderID, userID } = req.body;
      const file = req.files.file;
      const uploadedFile = Array.isArray(file) ? file[0] : file;
      const fileData = uploadedFile.data; // Obtener los datos del archivo directamente del buffer
    await Comprobantes.create({
        id,
        orderID,
        userID,
        data: fileData
    });
    res.json({
        message: 'Product successfully created',
    })
}*/
const updateComprobantes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const { id } = req.params;
    const productAux = yield Comprobantes_1.default.findByPk(id);
    if (productAux) {
        productAux.update(body);
        res.json({
            message: 'Product updated with success',
        });
    }
    else {
        res.status(404).json({ message: 'Error, product not found' });
    }
});
exports.updateComprobantes = updateComprobantes;
const deleteComprobantes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield Comprobantes_1.default.destroy({ truncate: true });
});
exports.deleteComprobantes = deleteComprobantes;
