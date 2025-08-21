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
exports.deleteAllFuelXprice = exports.updateFuelXprice = exports.postFuelXprice = exports.deleteFuelXprice = exports.getFuelXprice = exports.getFuelXprices = void 0;
const fuelXprice_1 = __importDefault(require("../models/mysql/fuelXprice"));
const getFuelXprices = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const listFuelXprice = yield fuelXprice_1.default.findAll();
    res.json(listFuelXprice);
});
exports.getFuelXprices = getFuelXprices;
const getFuelXprice = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const FuelXpriceAux = yield fuelXprice_1.default.findByPk(id);
    if (FuelXpriceAux) {
        res.json({
            FuelXpriceAux
        });
    }
    else {
        res.status(404).json({ message: 'Error, fuel register not found' });
    }
});
exports.getFuelXprice = getFuelXprice;
const deleteFuelXprice = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const FuelXpriceAux = yield fuelXprice_1.default.findByPk(`${id}`);
    if (FuelXpriceAux) {
        yield FuelXpriceAux.destroy();
        res.json({ message: 'Fuel register successfully deleted' });
    }
    else {
        res.status(404).json({ message: 'Error, fuel register not found' });
    }
});
exports.deleteFuelXprice = deleteFuelXprice;
const postFuelXprice = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    yield fuelXprice_1.default.create(body);
    res.json({
        message: 'fuel register successfully created',
    });
});
exports.postFuelXprice = postFuelXprice;
const updateFuelXprice = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const { id } = req.params;
    const FuelXpriceAux = yield fuelXprice_1.default.findByPk(id);
    if (FuelXpriceAux) {
        FuelXpriceAux.update(body);
        res.json({
            message: 'fuel register updated',
        });
    }
    else {
        res.status(404).json({ message: 'Error, fuel register not found' });
    }
});
exports.updateFuelXprice = updateFuelXprice;
const deleteAllFuelXprice = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield fuelXprice_1.default.destroy({ truncate: true });
});
exports.deleteAllFuelXprice = deleteAllFuelXprice;
