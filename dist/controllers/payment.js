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
exports.updatePayment = exports.deleteAllPayments = exports.postPayment = exports.deletePayment = exports.getPayment = exports.getPayments = void 0;
const payment_1 = __importDefault(require("../models/mysql/payment"));
const getPayments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const listPayments = yield payment_1.default.findAll();
    res.json(listPayments);
});
exports.getPayments = getPayments;
const getPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const PaymentAux = yield payment_1.default.findByPk(id);
    if (PaymentAux) {
        res.json({
            PaymentAux
        });
    }
    else {
        res.status(404).json({ message: 'Error, Payment not found' });
    }
});
exports.getPayment = getPayment;
const deletePayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const PaymentAux = yield payment_1.default.findByPk(`${id}`);
    if (PaymentAux) {
        yield PaymentAux.destroy();
        res.json({ message: 'Payment successfully deleted' });
    }
    else {
        res.status(404).json({ message: 'Error, Payment not found' });
    }
});
exports.deletePayment = deletePayment;
const postPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    yield payment_1.default.create(body);
    res.json({
        message: 'Payment Successfully created',
    });
});
exports.postPayment = postPayment;
const deleteAllPayments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield payment_1.default.destroy({ truncate: true });
});
exports.deleteAllPayments = deleteAllPayments;
const updatePayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const { id } = req.params;
    const PaymentAux = yield payment_1.default.findByPk(id);
    if (PaymentAux) {
        PaymentAux.update(body);
        res.json({
            message: 'Payment updated',
        });
    }
    else {
        res.status(404).json({ message: 'Error, Payment not found' });
    }
});
exports.updatePayment = updatePayment;
