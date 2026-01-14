"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.readCsvData = exports.createSeason = exports.modifySeason_teams = exports.addSeason_teams = exports.deleteSeason_team = exports.getAllSeason_teams = void 0;
const csv_parser_1 = __importDefault(require("csv-parser"));
const fs = __importStar(require("fs"));
const sequelize_1 = require("sequelize");
const associations_1 = require("../models/mysql/associations");
const getAllSeason_teams = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const season_teams = yield associations_1.Season_Teams.findAll();
        if (!season_teams) {
            return res.status(404).json({ message: "No season_teams found" });
        }
        return res.json(season_teams);
    }
    catch (err) {
        return res.status(500).json({ message: err });
    }
});
exports.getAllSeason_teams = getAllSeason_teams;
const deleteSeason_team = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Bad request" });
        }
        const season_team = yield associations_1.Season_Teams.findByPk(id);
        if (!season_team) {
            return res
                .status(404)
                .json({ message: "No season_teams found to delete" });
        }
        yield season_team.destroy();
        return res.status(200).json({ message: "Successfully deleted" });
    }
    catch (err) {
        return res.status(500).json({ message: err });
    }
});
exports.deleteSeason_team = deleteSeason_team;
const addSeason_teams = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { seasonID, teamID, chassis, engine, poles, points, podiums, wins, standings, } = req.body;
        const validated = validateSeasonTeams(seasonID, teamID, chassis, engine, poles, points, podiums, wins, standings);
        if (!validated) {
            return res.status(400).json({ message: "Bad request" });
        }
        const season_teams = {
            seasonID,
            teamID,
            chassis,
            engine,
            poles,
            points,
            podiums,
            wins,
            standings,
        };
        yield associations_1.Season_Teams.create(season_teams);
        return res.status(200).json({
            message: `Successfully added a season_team`,
        });
    }
    catch (err) {
        return res.status(500).json({ message: err });
    }
});
exports.addSeason_teams = addSeason_teams;
const modifySeason_teams = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newSeason_team = req.body;
        if (!newSeason_team) {
            return res.status(400).json({ message: "Bad request" });
        }
        const validated = validateSeasonTeams(newSeason_team.seasonID, newSeason_team.teamID, newSeason_team.chassis, newSeason_team.engine, newSeason_team.poles, newSeason_team.points, newSeason_team.podiums, newSeason_team.wins, newSeason_team.standings);
        if (!newSeason_team.id || !validated) {
            return res
                .status(400)
                .json({ message: "Not all fields contains a value" });
        }
        yield associations_1.Season_Teams.update({
            seasonID: newSeason_team.seasonID,
            teamID: newSeason_team.teamID,
            chassis: newSeason_team.chassis,
            engine: newSeason_team.engine,
            poles: newSeason_team.poles,
            points: newSeason_team.points,
            podiums: newSeason_team.podiums,
            wins: newSeason_team.wins,
            standings: newSeason_team.standings,
        }, { where: { id: newSeason_team.id } });
        return res.status(200).json({
            message: `Successfully updated the season_team ${newSeason_team.id}`,
        });
    }
    catch (err) {
        return res.status(500).json({ message: err });
    }
});
exports.modifySeason_teams = modifySeason_teams;
function validateSeasonTeams(seasonID, teamID, chassis, engine, poles, points, podiums, wins, standings) {
    if (!seasonID || !teamID || !chassis || !engine || !standings) {
        return false;
    }
    if ((poles && typeof poles !== "number") ||
        (points && typeof points !== "number") ||
        (podiums && typeof podiums !== "number") ||
        (wins && typeof wins !== "number") ||
        !standings ||
        typeof standings !== "number") {
        return false;
    }
    return true;
}
const createSeason = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //TO DO 1996, 1995, 1994, 1991, 1990, 89, 88, 87, 86, 85, 84, 82, 81, 80, 79, 78, 76, 75, 74, 73, 72, 71, 70, 69, 68, 67, 65, 63,62,61,60,59
    const filePath = "../zSeasonsTeams/Season2022.csv"; // Asegúrate de que la ruta sea correcta
    //const filePath = "../stdLeft.csv"; // Asegúrate de que la ruta sea correcta
    (0, exports.readCsvData)(filePath)
        .then((data) => __awaiter(void 0, void 0, void 0, function* () {
        for (let i = 0; i < data.length; i++) {
            const std = yield createData(data[i]);
            if (std) {
                yield associations_1.Season_Teams.create(std);
            }
        }
        return res.status(200).json({ message: `File ${filePath} Saved!` });
    }))
        .catch((error) => {
        console.error("No se pudo procesar el archivo CSV:", error);
        return res.status(500).json({ message: "Failed, check console" });
    });
});
exports.createSeason = createSeason;
function createData(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const season = yield associations_1.Seasons.findOne({
            where: { year: data.seasonID },
        });
        const team = yield associations_1.Teams.findOne({
            where: {
                name: {
                    [sequelize_1.Op.regexp]: `\\b${data.teamID.toLowerCase()}\\b`,
                },
            },
        });
        if (!team || !season) {
            console.log("MISSING!!!!!!!!!!!!!!!!");
            console.log("MISSING!!!!!!!!!!!!!!!!");
            console.log("MISSING!!!!!!!!!!!!!!!!");
            console.log("MISSING!!!!!!!!!!!!!!!!");
            console.log("MISSING!!!!!!!!!!!!!!!!");
            console.log(" AT TEAM ", data.teamID, " IN SEASON ", data.seasonID);
            if (!team) {
                console.log("NO TEAM");
            }
            if (!season) {
                console.log("NO SEASON");
            }
            console.log("MISSING!!!!!!!!!!!!!!!!");
            console.log("MISSING!!!!!!!!!!!!!!!!");
            console.log("MISSING!!!!!!!!!!!!!!!!");
            console.log("MISSING!!!!!!!!!!!!!!!!");
            console.log("MISSING!!!!!!!!!!!!!!!!");
            return undefined;
        }
        const seasonID = season.getDataValue("id");
        const teamID = team.getDataValue("id");
        const chassis = data.chassis;
        const engine = data.engine;
        const poles = data.poles;
        const points = data.points;
        const podiums = data.podiums;
        const wins = data.wins;
        const standings = data.standings;
        const std = {
            seasonID,
            teamID,
            chassis,
            engine,
            poles,
            points,
            podiums,
            wins,
            standings,
        };
        return std;
    });
}
const readCsvData = (filePath) => {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe((0, csv_parser_1.default)({ separator: "," })) // El separador de tu archivo es la coma
            .on("data", (data) => results.push(data))
            .on("end", () => {
            console.log(`Archivo ${filePath} leído exitosamente.`);
            resolve(results);
        })
            .on("error", (error) => {
            console.error(`Error al leer el archivo ${filePath}:`, error);
            reject(error);
        });
    });
};
exports.readCsvData = readCsvData;
