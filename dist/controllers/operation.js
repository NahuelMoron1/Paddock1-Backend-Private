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
exports.updateOperation = exports.postOperation = exports.deleteAllOperations = exports.deleteOperation = exports.getOperation = exports.getOperations = void 0;
const operation_1 = __importDefault(require("../models/mysql/operation"));
const getOperations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const listOperations = yield operation_1.default.findAll();
    res.json(listOperations);
});
exports.getOperations = getOperations;
const getOperation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const operation = yield operation_1.default.findByPk(id);
    if (operation) {
        res.json({
            operation
        });
    }
    else {
        res.status(404).json({ message: 'Error, operation not found' });
    }
});
exports.getOperation = getOperation;
const deleteOperation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const operation = yield operation_1.default.findByPk(`${id}`);
    if (operation) {
        yield operation.destroy();
        res.json({ message: 'Operation successfully deleted' });
    }
    else {
        res.status(404).json({ message: 'Error, operation not found' });
    }
});
exports.deleteOperation = deleteOperation;
const deleteAllOperations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield operation_1.default.destroy({ truncate: true });
});
exports.deleteAllOperations = deleteAllOperations;
const postOperation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    yield operation_1.default.create(body);
    res.json({
        message: 'Operation Successfully created',
    });
});
exports.postOperation = postOperation;
const updateOperation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const { id } = req.params;
    const operation = yield operation_1.default.findByPk(id);
    if (operation) {
        operation.update(body);
        res.json({
            message: 'Operation updated',
        });
    }
    else {
        res.status(404).json({ message: 'Error, operation not found' });
    }
});
exports.updateOperation = updateOperation;
