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
exports.updateGame = exports.deleteGameResults = exports.deleteGroup = exports.createResults = exports.createGroup = exports.createGame = exports.getResultsByGroupID = exports.getGroupsByGameID = exports.getGameByID = exports.getAllConnections = void 0;
const uuid_1 = require("uuid");
const Connections_1 = __importDefault(require("../models/mysql/Connections"));
const Connections_Groups_1 = __importDefault(require("../models/mysql/Connections_Groups"));
const Connections_Groups_Results_1 = __importDefault(require("../models/mysql/Connections_Groups_Results"));
const associations_1 = require("../models/mysql/associations");
const getAllConnections = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allConnections = yield Connections_1.default.findAll();
        if (!allConnections) {
            return res.status(404).json({ message: "No connections found" });
        }
        return res.status(200).json(allConnections);
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.getAllConnections = getAllConnections;
const getGameByID = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { gameID } = req.params;
        if (!gameID) {
            return res.status(400).json({ message: "No ID Provided" });
        }
        const connectionGame = yield Connections_1.default.findByPk(gameID);
        if (!connectionGame) {
            return res.status(404).json({ message: "No connection game found" });
        }
        return res.status(200).json(connectionGame);
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.getGameByID = getGameByID;
const getGroupsByGameID = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { gameID } = req.params;
        if (!gameID) {
            return res.status(400).json({ message: "No ID Provided" });
        }
        const groups = yield Connections_Groups_1.default.findAll({
            where: { gameID: gameID },
        });
        if (!groups) {
            return res.status(404).json({ message: "No group found" });
        }
        return res.status(200).json(groups);
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.getGroupsByGameID = getGroupsByGameID;
const getResultsByGroupID = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { groupID, type } = req.params;
        if (!groupID) {
            return res.status(400).json({ message: "No ID Provided" });
        }
        const groupResults = yield Connections_Groups_Results_1.default.findAll({
            where: { groupID: groupID },
        });
        if (!groupResults) {
            return res.status(404).json({ message: "No results found" });
        }
        const resultIDs = groupResults.map((gr) => gr.getDataValue("resultID"));
        let results = [];
        if (type === "driver") {
            results = yield associations_1.Drivers.findAll({ where: { id: resultIDs } });
            return res.status(200).json({ driver: results, groupID });
        }
        else if (type === "team") {
            results = yield associations_1.Teams.findAll({ where: { id: resultIDs } });
            return res.status(200).json({ team: results, groupID });
        }
        else if (type === "track") {
            results = yield associations_1.Tracks.findAll({ where: { id: resultIDs } });
            return res.status(200).json({ track: results, groupID });
        }
        else {
            return res.status(400).json({ message: "Invalid type" });
        }
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.getResultsByGroupID = getResultsByGroupID;
const createGame = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const game = req.body;
        if (!game || !game.date || !game.type || !game.amount_groups) {
            return res
                .status(400)
                .json({ message: "Not all fields contains a value" });
        }
        const date = game.date;
        const type = game.type;
        const amount_groups = game.amount_groups;
        if (typeof date !== "string" ||
            typeof type !== "string" ||
            typeof amount_groups !== "number") {
            return res.status(400).json({
                message: "There's a mistake on your try to create the game, please check every information you wrote.",
            });
        }
        const gameID = (0, uuid_1.v4)();
        const newGame = {
            id: gameID,
            date: date,
            type: type,
            amount_groups: amount_groups,
        };
        const created = yield Connections_1.default.create(newGame);
        if (!created) {
            return res.status(304).json({
                message: "Something failed while creating connections game. Please contact support",
            });
        }
        return res.status(200).json(gameID);
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.createGame = createGame;
const createGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const group = req.body;
        if (!group || !group.title || !group.gameID || !group.results) {
            return res
                .status(400)
                .json({ message: "Not all fields contains a value" });
        }
        const id = group.id;
        const title = group.title;
        const gameID = group.gameID;
        const results = group.results;
        if (typeof title !== "string" ||
            typeof gameID !== "string" ||
            typeof results !== "number") {
            return res.status(400).json({
                message: "There's a mistake on your try to create a group for game connections, please check every information you wrote.",
            });
        }
        const newGroup = {
            id: id,
            title: title,
            gameID: gameID,
            results: results,
        };
        const groupCreated = yield Connections_Groups_1.default.create(newGroup);
        return res.status(200).json(groupCreated);
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.createGroup = createGroup;
const createResults = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const results = req.body;
        if (!results || !results.gameID || !results.groupID || !results.resultID) {
            return res
                .status(400)
                .json({ message: "Not all fields contains a value" });
        }
        const groupID = results.groupID;
        const resultID = results.resultID;
        const gameID = results.gameID;
        if (typeof gameID !== "string" ||
            typeof groupID !== "string" ||
            typeof resultID !== "string") {
            return res.status(400).json({
                message: "There's a mistake on your try to create a group for game connections, please check every information you wrote.",
            });
        }
        const id = (0, uuid_1.v4)();
        const newResult = {
            id: id,
            gameID: gameID,
            groupID: groupID,
            resultID: resultID,
        };
        const created = yield Connections_Groups_Results_1.default.create(newResult);
        if (!created) {
            return res.status(304).json({
                message: "Something failed while creating connections results in game. Please contact support",
            });
        }
        return res.status(200).json(true);
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.createResults = createResults;
const deleteGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { groupID } = req.params;
        if (!groupID) {
            return res.status(400).json({ message: "No ID Provided" });
        }
        const deleted = yield Connections_Groups_1.default.destroy({
            where: { id: groupID },
        });
        if (!deleted) {
            return res.status(304).json({
                message: "Something failed while deleting group. Please contact support",
            });
        }
        return res.status(200).json(true);
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.deleteGroup = deleteGroup;
const deleteGameResults = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { groupID, resultID } = req.params;
        if (!groupID || !resultID) {
            return res.status(400).json({ message: "No ID Provided" });
        }
        const deleted = yield Connections_Groups_Results_1.default.destroy({
            where: { groupID: groupID, resultID: resultID },
        });
        if (!deleted) {
            return res.status(304).json({
                message: "Something failed while deleting results. Please contact support",
            });
        }
        return res.status(200).json(true);
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.deleteGameResults = deleteGameResults;
const updateGame = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { gameID } = req.params;
        if (!gameID) {
            return res.status(400).json({ message: "No ID Provided" });
        }
        const game = req.body;
        if (!game || !game.date || !game.type || !game.amount_groups) {
            return res
                .status(400)
                .json({ message: "Not all fields contains a value" });
        }
        const date = game.date;
        const type = game.type;
        const amount_groups = game.amount_groups;
        if (typeof date !== "string" ||
            typeof type !== "string" ||
            typeof amount_groups !== "number") {
            return res.status(400).json({
                message: "There's a mistake on your try to update the game, please check every information you wrote.",
            });
        }
        const updated = yield Connections_1.default.update({ date: date, type: type, amount_groups: amount_groups }, { where: { id: gameID } });
        if (!updated) {
            return res.status(304).json({
                message: "Something failed while updating game. Please contact support",
            });
        }
        return res.status(200).json(true);
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.updateGame = updateGame;
