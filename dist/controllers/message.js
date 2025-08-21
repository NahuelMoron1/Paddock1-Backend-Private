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
exports.deleteAllMessages = exports.updateMessage = exports.postMessage = exports.deleteMessage = exports.getMessage = exports.getMessages = void 0;
const message_1 = __importDefault(require("../models/mysql/message"));
const getMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const listMessages = yield message_1.default.findAll();
    res.json(listMessages);
});
exports.getMessages = getMessages;
const getMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const messageAux = yield message_1.default.findByPk(id);
    if (messageAux) {
        res.json({
            messageAux
        });
    }
    else {
        res.status(404).json({ message: 'Error, Message not found' });
    }
});
exports.getMessage = getMessage;
const deleteMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const messageAux = yield message_1.default.findByPk(`${id}`);
    if (messageAux) {
        yield messageAux.destroy();
        res.json({ message: 'Message successfully deleted' });
    }
    else {
        res.status(404).json({ message: 'Error, Message not found' });
    }
});
exports.deleteMessage = deleteMessage;
const postMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    yield message_1.default.create(body);
    res.json({
        message: 'Message Successfully created',
    });
});
exports.postMessage = postMessage;
const updateMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const { id } = req.params;
    const messageAux = yield message_1.default.findByPk(id);
    if (messageAux) {
        messageAux.update(body);
        res.json({
            message: 'Message updated',
        });
    }
    else {
        res.status(404).json({ message: 'Error, message not found' });
    }
});
exports.updateMessage = updateMessage;
const deleteAllMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield message_1.default.destroy({ truncate: true });
});
exports.deleteAllMessages = deleteAllMessages;
