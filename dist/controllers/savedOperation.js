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
exports.deleteAllSavedOps = exports.updateSavedOp = exports.postSavedOp = exports.deleteSavedOp = exports.getSavedOp = exports.getSaved = void 0;
const savedOperation_1 = __importDefault(require("../models/mysql/savedOperation"));
const operation_1 = __importDefault(require("../models/mysql/operation"));
const getSaved = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const listSavedOp = yield savedOperation_1.default.findAll({
        include: [{
                model: operation_1.default,
                required: true // Esto asegura que solo se incluyan las operaciones que tienen una coincidencia en la tabla Operations
            }]
    });
    res.json(listSavedOp);
});
exports.getSaved = getSaved;
const getSavedOp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const SavedOpAux = yield savedOperation_1.default.findByPk(id);
    if (SavedOpAux) {
        res.json({
            SavedOpAux
        });
    }
    else {
        res.status(404).json({ message: 'Error, SavedOp not found' });
    }
});
exports.getSavedOp = getSavedOp;
const deleteSavedOp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const SavedOpAux = yield savedOperation_1.default.findByPk(`${id}`);
    if (SavedOpAux) {
        yield SavedOpAux.destroy();
        res.json({ message: 'SavedOp successfully deleted' });
    }
    else {
        res.status(404).json({ message: 'Error, SavedOp not found' });
    }
});
exports.deleteSavedOp = deleteSavedOp;
const postSavedOp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = req.body;
        yield savedOperation_1.default.create(body);
        res.json({
            message: 'SavedOp Successfully created',
        });
    }
    catch (error) {
        console.error('Error creating SavedOp:', error);
        res.status(500).json({
            message: 'An error occurred while creating SavedOp',
            error: error.message // Envía el mensaje de error al cliente para facilitar la depuración
        });
    }
});
exports.postSavedOp = postSavedOp;
const updateSavedOp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const { id } = req.params;
    const SavedOpAux = yield savedOperation_1.default.findByPk(id);
    if (SavedOpAux) {
        SavedOpAux.update(body);
        res.json({
            message: 'SavedOp updated',
        });
    }
    else {
        res.status(404).json({ message: 'Error, SavedOp not found' });
    }
});
exports.updateSavedOp = updateSavedOp;
const deleteAllSavedOps = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield savedOperation_1.default.destroy({ truncate: true });
});
exports.deleteAllSavedOps = deleteAllSavedOps;
