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
exports.readCsvData = exports.createSeason = exports.getBySeason_Teams_Drivers = exports.getAllSeason_Teams_Drivers = void 0;
const csv_parser_1 = __importDefault(require("csv-parser"));
const fs = __importStar(require("fs"));
const sequelize_1 = require("sequelize");
const associations_1 = require("../models/mysql/associations");
const getAllSeason_Teams_Drivers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const season_tracks = yield associations_1.Season_Teams_Drivers.findAll({
            include: [
                {
                    model: associations_1.Seasons, // Incluye el equipo también si lo necesitas
                    attributes: ["year"],
                },
                {
                    model: associations_1.Drivers, // Especifica el modelo que quieres incluir
                    attributes: ["firstname", "lastname"],
                }, // Trae solo el campo 'driverName' de la tabla Drivers
                {
                    model: associations_1.Teams, // Incluye el equipo también si lo necesitas
                    attributes: ["name"],
                },
            ],
        });
        if (!season_tracks) {
            return res.status(404).json({ message: "No season_tracks found" });
        }
        return res.json(season_tracks);
    }
    catch (err) {
        return res.status(500).json({ message: err });
    }
});
exports.getAllSeason_Teams_Drivers = getAllSeason_Teams_Drivers;
const getBySeason_Teams_Drivers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { year } = req.params;
    const yearNumber = parseInt(year, 10);
    if (isNaN(yearNumber)) {
        return res
            .status(400)
            .json({ message: "Bad request: 'year' must be a number." });
    }
    try {
        const season = yield associations_1.Seasons.findOne({
            where: {
                year: yearNumber,
            },
            attributes: ["id"], // Solo necesitamos el ID para la siguiente consulta
        });
        if (!season) {
            return res
                .status(404)
                .json({ message: `No season found for year: ${yearNumber}` });
        }
        const season_drivers_data = yield associations_1.Season_Teams_Drivers.findAll({
            where: {
                seasonID: season.getDataValue("id"), // Filtra por el ID de la temporada encontrada
            },
            include: [
                {
                    model: associations_1.Drivers,
                    attributes: ["firstname", "lastname"],
                },
                {
                    model: associations_1.Teams, // Incluye el equipo también si lo necesitas
                    attributes: ["name"],
                },
            ],
        });
        if (!season_drivers_data) {
            return res.status(404).json({ message: "No season_tracks found" });
        }
        /*for (let i = 0; i < season_drivers_data.length; i++) {
          season_drivers_data[i].destroy();
        }*/
        console.log(season_drivers_data.length);
        return res.json(season_drivers_data);
    }
    catch (err) {
        return res.status(500).json({ message: err });
    }
});
exports.getBySeason_Teams_Drivers = getBySeason_Teams_Drivers;
const createSeason = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //const filePath = "../zSeasons/Season2001 - Sheet1.csv"; // Asegúrate de que la ruta sea correcta
    const filePath = "../stdLeft.csv"; // Asegúrate de que la ruta sea correcta
    (0, exports.readCsvData)(filePath)
        .then((data) => __awaiter(void 0, void 0, void 0, function* () {
        const transformed = transformDriverData(data, 2000);
        for (let i = 0; i < transformed.length; i++) {
            const std = yield createData(transformed[i]);
            if (std) {
                yield associations_1.Season_Teams_Drivers.create(std);
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
function transformDriverData(rawData, seasonID) {
    return rawData.map((entry) => {
        const [firstname, ...rest] = entry.Piloto.split(" ");
        const lastname = rest.join(" ");
        return {
            seasonID,
            teamID: entry["Escudería"],
            car_number: 0,
            laps_led: extractNumericValue(entry["Vueltas lideradas"]),
            race_starts: extractRaceStarts(entry["Grandes Premios"]),
            fastest_laps: extractNumericValue(entry["Vueltas rápidas"]),
            poles: extractNumericValue(entry["*Poles*"]),
            points: extractNumericValue(entry["Puntos"]),
            podiums: extractNumericValue(entry["Podios"]),
            wins: extractNumericValue(entry["Victorias"]),
            standings: extractNumericValue(entry["Pos."]),
            firstname,
            lastname,
        };
    });
}
function safeLowerCase(value) {
    return typeof value === "string" ? value.toLowerCase() : "";
}
function extractRaceStarts(value) {
    if (!value) {
        return 0;
    }
    const match = value.match(/\((\d+)\)/);
    if (match) {
        return parseInt(match[1]); // número dentro de los paréntesis
    }
    return parseInt(value) || 0; // si no hay paréntesis, usa el número directo
}
function extractNumericValue(value) {
    if (typeof value !== "string") {
        return 0;
    }
    const cleaned = value.replace(/[^\d]/g, "");
    return parseInt(cleaned) || 0;
}
function createData(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const driver = yield associations_1.Drivers.findOne({
            where: { firstname: data.firstname, lastname: data.lastname },
        });
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
        if (!driver || !team || !season) {
            console.log("MISSING!!!!!!!!!!!!!!!!");
            console.log("MISSING!!!!!!!!!!!!!!!!");
            console.log("MISSING!!!!!!!!!!!!!!!!");
            console.log("MISSING!!!!!!!!!!!!!!!!");
            console.log("MISSING!!!!!!!!!!!!!!!!");
            console.log("NO INFO FOUND FOR ", data.firstname, " ", data.lastname, " AT TEAM ", data.teamID, " IN SEASON ", data.seasonID);
            if (!driver) {
                console.log("NO DRIVER");
            }
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
        const driverID = driver.getDataValue("id");
        const car_number = data.car_number;
        const race_starts = data.race_starts;
        const laps_led = data.laps_led;
        const fastest_laps = data.fastest_laps;
        const poles = data.poles;
        const points = data.points;
        const podiums = data.podiums;
        const wins = data.wins;
        const standings = data.standings;
        const std = {
            seasonID,
            teamID,
            driverID,
            car_number,
            race_starts,
            laps_led,
            fastest_laps,
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
