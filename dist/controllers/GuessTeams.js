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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGuessTeamGame = void 0;
const uuid_1 = require("uuid");
const associations_1 = require("../models/mysql/associations");
const createGuessTeamGame = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const results = req.body;
        if (!results || !results.newGame) {
            return res
                .status(400)
                .json({ message: "Not all fields contains a value" });
        }
        const newGameParams = results.newGame;
        const isValid = yield validateGuessTeamParams(newGameParams);
        if (!isValid) {
            return res
                .status(400)
                .json({ message: "Some parameters are not as expected" });
        }
        const newGame = {
            id: (0, uuid_1.v4)(),
            date: newGameParams.date,
            team_id: newGameParams.team_id,
            team_principal: newGameParams.team_principal,
            tp_flag: newGameParams.tp_flag,
            driver1_id: newGameParams.driver1_id,
            driver2_id: newGameParams.driver2_id,
            season_id: newGameParams.season_id,
        };
        yield associations_1.GuessTeams.create(newGame);
        return res.status(200).json({ message: "Game created successfully" });
    }
    catch (err) {
        return res.status(500).json({ message: err });
    }
});
exports.createGuessTeamGame = createGuessTeamGame;
function validateGuessTeamParams(results) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!results.date ||
            !results.team_id ||
            !results.team_principal ||
            !results.tp_flag ||
            !results.driver1_id ||
            !results.driver2_id ||
            !results.season_id) {
            return false;
        }
        if (typeof results.date !== "string" ||
            typeof results.team_id !== "string" ||
            typeof results.team_principal !== "string" ||
            typeof results.tp_flag !== "string" ||
            typeof results.driver1_id !== "string" ||
            typeof results.driver2_id !== "string" ||
            typeof results.season_id !== "string") {
            return false;
        }
        const driver1 = yield associations_1.Drivers.findByPk(results.driver1_id);
        const driver2 = yield associations_1.Drivers.findByPk(results.driver2_id);
        const season = yield associations_1.Seasons.findByPk(results.season_id);
        const team = yield associations_1.Teams.findByPk(results.team_id);
        if (!driver1 || !driver2 || !season || !team) {
            return false;
        }
        return true;
    });
}
