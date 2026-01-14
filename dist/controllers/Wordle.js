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
const node_cron_1 = __importDefault(require("node-cron"));
const sequelize_1 = require("sequelize");
const associations_1 = require("../models/mysql/associations");
const WordleWord_1 = __importDefault(require("../models/mysql/WordleWord"));
node_cron_1.default.schedule("0 0 * * *", () => __awaiter(void 0, void 0, void 0, function* () {
    const count = yield associations_1.Drivers.count({
        where: {
            popularity: {
                [sequelize_1.Op.between]: [3, 5],
            },
        },
    });
    const offset = Math.floor(Math.random() * count);
    const recentWords = yield WordleWord_1.default.findAll({
        order: [["date", "DESC"]],
        limit: 7,
    });
    const excluded = recentWords.map((w) => w.getDataValue("word"));
    const driver = yield associations_1.Drivers.findOne({
        where: {
            popularity: {
                [sequelize_1.Op.between]: [3, 5],
            },
            lastname: {
                [sequelize_1.Op.notIn]: excluded,
            },
        },
        offset,
    });
    if (driver) {
        const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
        yield WordleWord_1.default.upsert({
            date: today,
            word: driver.getDataValue("lastname").toLowerCase(),
        });
        console.log(`Wordle actualizado: ${driver.getDataValue("lastname")}`);
    }
}));
