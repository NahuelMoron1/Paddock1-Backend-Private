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
exports.updateBest10GameResults = exports.updateBest10GameResultsCore = exports.getGameData = exports.createBest10Game = exports.createBest10GameManual = exports.getSuggestions = void 0;
const sequelize_1 = require("sequelize");
const uuid_1 = require("uuid");
const Top10Creation_1 = require("../models/enums/Top10Creation");
const associations_1 = require("../models/mysql/associations");
const Best_tens_1 = __importDefault(require("../models/mysql/Best_tens"));
const Best_tens_results_1 = __importDefault(require("../models/mysql/Best_tens_results"));
const Drivers_1 = __importDefault(require("../models/mysql/Drivers"));
const Manual_Best_Tens_Results_1 = __importDefault(require("../models/mysql/Manual_Best_Tens_Results"));
const Season_Teams_Drivers_1 = __importDefault(require("../models/mysql/Season_Teams_Drivers"));
const Seasons_1 = __importDefault(require("../models/mysql/Seasons"));
const Teams_1 = __importDefault(require("../models/mysql/Teams"));
const getSuggestions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { type, input } = req.params;
    if (!input || !type) {
        return res.status(400).json({ message: "Missing input or type" });
    }
    const normalized = input.trim().toLowerCase();
    let results = [];
    console.log(type);
    try {
        switch (type) {
            case "driver":
                results = yield Drivers_1.default.findAll({
                    where: sequelize_1.Sequelize.where(sequelize_1.Sequelize.fn("lower", sequelize_1.Sequelize.fn("concat", sequelize_1.Sequelize.col("firstname"), " ", sequelize_1.Sequelize.col("lastname"))), {
                        [sequelize_1.Op.like]: `%${normalized}%`,
                    }),
                });
                break;
            case "team":
                results = yield Teams_1.default.findAll({
                    where: sequelize_1.Sequelize.where(sequelize_1.Sequelize.fn("lower", sequelize_1.Sequelize.col("name")), {
                        [sequelize_1.Op.like]: `%${normalized}%`,
                    }),
                });
                break;
            case "track":
                results = yield associations_1.Tracks.findAll({
                    where: sequelize_1.Sequelize.where(sequelize_1.Sequelize.fn("lower", sequelize_1.Sequelize.col("track_name")), {
                        [sequelize_1.Op.like]: `%${normalized}%`,
                    }),
                });
                break;
            case "season":
                results = yield Seasons_1.default.findAll({
                    where: sequelize_1.Sequelize.where(sequelize_1.Sequelize.fn("lower", sequelize_1.Sequelize.col("year")), {
                        [sequelize_1.Op.like]: `%${normalized}%`,
                    }),
                });
                break;
            default:
                return res.status(400).json({ message: "Invalid type" });
        }
        const suggestions = results.map((r) => ({
            id: r.id,
            name: type === "driver"
                ? `${r.firstname} ${r.lastname}`
                : type === "team"
                    ? r.name
                    : type === "season"
                        ? r.year
                        : r.track_name,
        }));
        return res.status(200).json(suggestions);
    }
    catch (error) {
        return res
            .status(500)
            .json({ message: "Error fetching suggestions", error });
    }
});
exports.getSuggestions = getSuggestions;
const createBest10GameManual = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const gamedata = req.body;
        if (!gamedata) {
            return res.status(400).json({ message: "Bad request" });
        }
        const title = gamedata.gamedata.title;
        const date = gamedata.gamedata.date;
        const type = gamedata.gamedata.type;
        const statType = gamedata.gamedata.statType; //Table could be standings, points, podiums, etc.
        const results = gamedata.gamedata.results;
        if (!title || !date || !type || !results || !statType) {
            return res
                .status(400)
                .json({ message: "Not all fields contains a value" });
        }
        if (typeof title !== "string" ||
            typeof type !== "string" ||
            typeof statType !== "string" ||
            !Array.isArray(results) ||
            !results.every((item) => typeof item === "object" &&
                item !== null &&
                typeof item.resultID === "string" &&
                typeof item.totalStat === "number" &&
                typeof item.position === "number")) {
            return res
                .status(400)
                .json({ message: "Something failed on the format to create game" });
        }
        if (results.length !== 10) {
            return res.status(400).json({
                message: `You need to have exactly 10 results, currently you have ${results.length}`,
            });
        }
        const game = {
            id: (0, uuid_1.v4)(),
            title,
            date,
            type,
            table: statType,
            creation: Top10Creation_1.Top10Creation.MANUAL,
        };
        const gameCreated = yield Best_tens_1.default.create(game);
        if (!gameCreated) {
            return res
                .status(500)
                .json({ message: "There was an error while creating the game" });
        }
        const gameID = gameCreated.getDataValue("id");
        for (let result of results) {
            const top10Result = {
                id: (0, uuid_1.v4)(),
                gameID: gameID,
                resultID: result.resultID,
                totalStat: result.totalStat,
                position: result.position,
            };
            yield Manual_Best_Tens_Results_1.default.create(top10Result);
        }
        return res.status(200).json({ message: "Game created successfully" });
    }
    catch (err) {
        res.status(500).json({ error: "Server error", details: err });
    }
});
exports.createBest10GameManual = createBest10GameManual;
const createBest10Game = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const gamedata = req.body;
        if (!gamedata) {
            return res.status(400).json({ message: "Bad request" });
        }
        const year = gamedata.gamedata.year;
        const table = gamedata.gamedata.table; //Table could be standings, points, podiums, etc.
        const title = gamedata.gamedata.title;
        const fromYear = gamedata.gamedata.fromYear;
        const toYear = gamedata.gamedata.toYear;
        const nationality = gamedata.gamedata.nationality;
        const date = gamedata.gamedata.date;
        const team = gamedata.gamedata.team;
        const sqlTable = gamedata.gamedata.sqlTable;
        const type = gamedata.gamedata.type; //Type refers to if it's driver/team/track
        if (!title || !table || !sqlTable) {
            return res
                .status(400)
                .json({ message: "Not all fields contains a value" });
        }
        const game = {
            id: (0, uuid_1.v4)(),
            title,
            year: year || null,
            fromYear: fromYear || null,
            toYear: toYear || null,
            nationality,
            table,
            date,
            team,
            sqlTable,
            type,
            creation: Top10Creation_1.Top10Creation.AUTOMATIC,
        };
        const result = yield Best_tens_1.default.create(game);
        if (!result) {
            return res.status(304).json({
                message: "Something failed on creating automatic game, please contact support",
            });
        }
        const gameID = yield result.getDataValue("id");
        const validated = updateAutomaticResults(gameID, result, true);
        if (!validated) {
            yield Best_tens_1.default.truncate({ where: { id: gameID } });
            return res.status(400).json({
                message: "Cannot create this challenge: Not enough data to complete the top 10",
            });
        }
        return res.status(200).json({ message: "Game created successfully" });
    }
    catch (err) {
        res.status(500).json({ error: "Server error", details: err });
    }
});
exports.createBest10Game = createBest10Game;
const getGameData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const challenge = yield Best_tens_1.default.findOne({
        where: { date: today },
    });
    if (!challenge) {
        return res.status(404).json({ message: "No challenge found for today" });
    }
    return res.status(200).json({
        id: challenge.getDataValue("id"),
        title: challenge.getDataValue("title"),
        type: challenge.getDataValue("type"),
        table: challenge.getDataValue("table"),
    });
});
exports.getGameData = getGameData;
// Core function for updating Best10 game results (without HTTP dependencies)
const updateBest10GameResultsCore = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
        const challenge = yield Best_tens_1.default.findOne({
            where: { date: today },
        });
        if (!challenge) {
            return { success: false, message: "No challenge found" };
        }
        const creation = challenge.getDataValue("creation");
        if (!creation) {
            return {
                success: true,
                message: "Nothing to update because the method is not selected",
            };
        }
        yield Best_tens_results_1.default.truncate();
        const id = challenge.getDataValue("id");
        if (creation === Top10Creation_1.Top10Creation.MANUAL) {
            const updated = yield updateManualResults(id);
            if (!updated) {
                return {
                    success: false,
                    message: "Something happened while getting results, unexpected amount of results",
                };
            }
        }
        else if (creation === Top10Creation_1.Top10Creation.AUTOMATIC) {
            const updated = yield updateAutomaticResults(id, challenge);
            if (!updated) {
                return { success: false, message: "No info found for that search" };
            }
        }
        return { success: true, message: "Game updated successfully" };
    }
    catch (err) {
        return { success: false, message: `Server error: ${err.message}` };
    }
});
exports.updateBest10GameResultsCore = updateBest10GameResultsCore;
const updateBest10GameResults = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    ///THIS IS TO UPDATE RESULTS EACH DAY
    const result = yield (0, exports.updateBest10GameResultsCore)();
    if (result.success) {
        return res.status(200).json({ message: result.message });
    }
    else {
        return res
            .status(result.message.includes("No challenge found") ? 404 : 500)
            .json({ error: result.message });
    }
});
exports.updateBest10GameResults = updateBest10GameResults;
function updateAutomaticResults(id, challenge, validation) {
    return __awaiter(this, void 0, void 0, function* () {
        const year = challenge.getDataValue("year");
        const fromYear = challenge.getDataValue("fromYear");
        const toYear = challenge.getDataValue("toYear");
        ///const type = gamedata.type; ///Type refers to: drivers/teams
        const nationality = challenge.getDataValue("nationality");
        const table = challenge.getDataValue("table"); ///Table refers to: points/podiums/wins/laps_led/race_Starts/standings
        const team = challenge.getDataValue("team");
        const sqlTable = challenge.getDataValue("sqlTable");
        let topStats;
        if (year && !nationality && !team) {
            topStats = yield getWithoutParams(year, sqlTable, table);
        }
        else {
            topStats = yield getWithParams(table, nationality, fromYear, toYear, year, team, sqlTable);
        }
        if (!topStats) {
            return false;
        }
        topStats.forEach((result, index) => __awaiter(this, void 0, void 0, function* () {
            const resultID = getID(sqlTable, result);
            const best10 = {
                id: (0, uuid_1.v4)(),
                gameID: id,
                resultID: resultID,
                totalStat: result.getDataValue("totalStat"),
                position: index + 1,
            };
            if (!validation) {
                yield Best_tens_results_1.default.create(best10);
            }
            else if (validation === true) {
                return topStats.length === 10;
            }
        }));
        return true;
    });
}
function updateManualResults(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const results = yield Manual_Best_Tens_Results_1.default.findAll({
            where: { gameid: id },
        });
        if (results.length !== 10) {
            return false;
        }
        for (let result of results) {
            yield Best_tens_results_1.default.create(result.toJSON());
        }
        return true;
    });
}
function getID(sqlTable, result) {
    let resultID = "";
    switch (sqlTable) {
        case "Season_Teams_Drivers":
            resultID = result.getDataValue("driverID");
            break;
        case "Season_Teams":
            resultID = result.getDataValue("teamID");
            break;
        case "Season_Tracks":
            resultID = result.getDataValue("trackID");
            break;
    }
    return resultID;
}
function getWithoutParams(year, sqlTable, table) {
    return __awaiter(this, void 0, void 0, function* () {
        let topStats;
        const seasonID = yield findSeason(year);
        switch (sqlTable) {
            case "Season_Teams_Drivers":
                topStats = yield findStdBySeason(seasonID, table, "DESC");
                break;
            case "Season_Teams":
                topStats = yield findSeasonTeamsBySeason(seasonID, table, "DESC");
                break;
            case "Season_Tracks":
                topStats = yield findSeasonTracksBySeason(seasonID, table, "DESC");
                break;
            default:
                topStats = undefined;
                break;
        }
        return topStats;
    });
}
function getWithParams(table, nationality, fromYear, toYear, year, team, sqlTable) {
    return __awaiter(this, void 0, void 0, function* () {
        const options = {
            stat: table,
            nationality,
            fromYear,
            toYear,
            seasonYear: year,
            team,
        };
        let topStats;
        switch (sqlTable) {
            case "Season_Teams_Drivers":
                topStats = yield getTopDriversByStat(options);
                break;
            case "Season_Teams":
                topStats = yield getTopTeamsByStat(options);
                break;
            case "Season_Tracks":
                topStats = yield getTopTracksByStat(options);
                break;
            default:
                topStats = undefined;
                break;
        }
        return topStats;
    });
}
function findSeason(year) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const season = yield Seasons_1.default.findOne({ where: { year: year } });
            if (!season) {
                return undefined;
            }
            return season.getDataValue("id");
        }
        catch (error) {
            console.log("ERROR: ", error);
            return undefined;
        }
    });
}
function findStdBySeason(seasonID, table, type) {
    return __awaiter(this, void 0, void 0, function* () {
        ///Type means DESC or ASC
        try {
            const std = yield Season_Teams_Drivers_1.default.findAll({
                where: { seasonID },
                include: [
                    {
                        model: Drivers_1.default,
                        attributes: ["firstname", "lastname", "nationality", "image"],
                    },
                ],
                attributes: ["driverID", [(0, sequelize_1.fn)("SUM", (0, sequelize_1.col)(table)), "totalStat"]],
                group: ["Season_Teams_Drivers.driverID"], // ← agrupás por driver
                order: [[(0, sequelize_1.literal)("totalStat"), type]], // ← ordenás por el alias
                limit: 10,
            });
            if (!std) {
                return undefined;
            }
            return std;
        }
        catch (error) {
            console.log("ERROR: ", error);
            return undefined;
        }
    });
}
function findSeasonTeamsBySeason(seasonID, table, type) {
    return __awaiter(this, void 0, void 0, function* () {
        ///Type means DESC or ASC
        try {
            const std = yield associations_1.Season_Teams.findAll({
                where: { seasonID: seasonID },
                include: [
                    {
                        model: Teams_1.default,
                        attributes: [
                            "id",
                            "name",
                            "common_name",
                            "championships",
                            "base",
                            "logo",
                        ],
                    },
                ],
                order: [[table, type]], // o 'ASC' si querés orden ascendente
                limit: 10,
            });
            if (!std) {
                return undefined;
            }
            return std;
        }
        catch (error) {
            console.log("ERROR: ", error);
            return undefined;
        }
    });
}
function findSeasonTracksBySeason(seasonID, table, type) {
    return __awaiter(this, void 0, void 0, function* () {
        ///Type means DESC or ASC
        try {
            const std = yield associations_1.Season_Tracks.findAll({
                where: { seasonID: seasonID },
                include: [
                    {
                        model: associations_1.Tracks,
                        attributes: [
                            "id",
                            "location",
                            "track_name",
                            "gmt_offset",
                            "length",
                            "country",
                            "image",
                        ],
                    },
                ],
                order: [[table, type]], // o 'ASC' si querés orden ascendente
                limit: 10,
            });
            if (!std) {
                return undefined;
            }
            return std;
        }
        catch (error) {
            console.log("ERROR: ", error);
            return undefined;
        }
    });
}
function getTopDriversByStat(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const { stat, nationality, fromYear, toYear, seasonYear, limit = 10, order = "DESC", } = options;
        try {
            const whereSeason = {};
            if (seasonYear) {
                whereSeason.year = seasonYear.toString();
            }
            else if (fromYear && toYear) {
                whereSeason.year = {
                    [sequelize_1.Op.between]: [fromYear.toString(), toYear.toString()],
                };
            }
            const results = yield Season_Teams_Drivers_1.default.findAll({
                include: [
                    Object.assign({ model: Drivers_1.default, attributes: ["id", "firstname", "lastname", "nationality", "image"] }, (nationality && { where: { nationality } })),
                    Object.assign({ model: Seasons_1.default, attributes: [] }, (Object.keys(whereSeason).length && { where: whereSeason })),
                ],
                attributes: ["driverID", [(0, sequelize_1.fn)("SUM", (0, sequelize_1.col)(stat)), "totalStat"]],
                group: ["driverID", "Driver.id"],
                order: [[(0, sequelize_1.literal)("totalStat"), order]],
                limit,
            });
            console.log("RESULTS: ", results);
            return results;
        }
        catch (error) {
            console.error("Error in getTopDriversByStat:", error);
            return undefined;
        }
    });
}
function getTopTeamsByStat(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const { stat, fromYear, toYear, seasonYear, limit = 10, order = "DESC", } = options;
        try {
            const whereSeason = {};
            if (seasonYear) {
                whereSeason.year = seasonYear.toString();
            }
            else if (fromYear && toYear) {
                whereSeason.year = {
                    [sequelize_1.Op.between]: [fromYear.toString(), toYear.toString()],
                };
            }
            const results = yield associations_1.Season_Teams.findAll({
                include: [
                    {
                        model: Teams_1.default,
                        attributes: [
                            "id",
                            "name",
                            "common_name",
                            "championships",
                            "base",
                            "logo",
                        ],
                    },
                    Object.assign({ model: Seasons_1.default, attributes: [] }, (Object.keys(whereSeason).length && { where: whereSeason })),
                ],
                attributes: ["teamID", [(0, sequelize_1.fn)("SUM", (0, sequelize_1.col)(stat)), "totalStat"]],
                group: ["teamID", "Team.id"],
                order: [[(0, sequelize_1.literal)("totalStat"), order]],
                limit,
            });
            return results;
        }
        catch (error) {
            console.error("Error in getTopTeamsByStat:", error);
            return undefined;
        }
    });
}
function getTopTracksByStat(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const { stat, nationality, fromYear, toYear, seasonYear, limit = 10, order = "DESC", } = options;
        try {
            const whereSeason = {};
            if (seasonYear) {
                whereSeason.year = seasonYear.toString();
            }
            else if (fromYear && toYear) {
                whereSeason.year = {
                    [sequelize_1.Op.between]: [fromYear.toString(), toYear.toString()],
                };
            }
            const results = yield Season_Teams_Drivers_1.default.findAll({
                include: [
                    Object.assign({ model: Drivers_1.default, attributes: [
                            "id",
                            "location",
                            "track_name",
                            "gmt_offset",
                            "length",
                            "country",
                            "image",
                        ] }, (nationality && { where: { nationality } })),
                    Object.assign({ model: Seasons_1.default, attributes: [] }, (Object.keys(whereSeason).length && { where: whereSeason })),
                ],
                attributes: ["driverID", [(0, sequelize_1.fn)("SUM", (0, sequelize_1.col)(stat)), "totalStat"]],
                group: ["driverID", "Driver.id"],
                order: [[(0, sequelize_1.literal)("totalStat"), order]],
                limit,
            });
            return results;
        }
        catch (error) {
            console.error("Error in getTopDriversByStat:", error);
            return undefined;
        }
    });
}
