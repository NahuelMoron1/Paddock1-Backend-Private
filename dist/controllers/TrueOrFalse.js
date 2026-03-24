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
exports.deleteTrueOrFalseGame = exports.updateTrueOrFalseGame = exports.createTrueOrFalseGame = exports.getGameById = exports.getAllTrueOrFalseGames = void 0;
const associations_1 = require("../models/mysql/associations");
const Users_1 = require("./Users");
// Validación básica de datos del juego
const validateTrueOrFalseGame = (title, date, statements) => {
    if (!title ||
        !date ||
        !Array.isArray(statements) ||
        statements.length === 0) {
        return false;
    }
    for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i];
        if (!stmt.statement ||
            stmt.answer === undefined ||
            !stmt.trueDescription ||
            !stmt.driverId) {
            return false;
        }
        if (stmt.answer === false && !stmt.falseDescription) {
            return false;
        }
    }
    return true;
};
// Obtener todos los juegos TrueOrFalse
const getAllTrueOrFalseGames = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield (0, Users_1.getUserLogged)(req);
        if (!user || !(0, Users_1.isAdmin)(user)) {
            return res
                .status(401)
                .json({ message: "Unauthorized to get all true or false games" });
        }
        const games = yield associations_1.TrueOrFalse.findAll({
            order: [["date", "DESC"]],
        });
        return res.status(200).json(games);
    }
    catch (error) {
        console.error("Error getting true or false games:", error);
        return res.status(500).json({ message: error });
    }
});
exports.getAllTrueOrFalseGames = getAllTrueOrFalseGames;
// Obtener un juego específico por ID con sus statements
const getGameById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield (0, Users_1.getUserLogged)(req);
        if (!user || !(0, Users_1.isAdmin)(user)) {
            return res
                .status(401)
                .json({ message: "Unauthorized to get game by ID" });
        }
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Game ID is required" });
        }
        const game = yield associations_1.TrueOrFalse.findByPk(id);
        if (!game) {
            return res.status(404).json({ message: "Game not found" });
        }
        // Obtener todos los statements del juego
        const statements = yield associations_1.TrueOrFalse_Statements.findAll({
            where: { gameID: id },
            order: [["order", "ASC"]],
        });
        const statementsWithDrivers = [];
        for (const stmt of statements) {
            const driver = yield associations_1.Drivers.findByPk(stmt.getDataValue("driverId"));
            statementsWithDrivers.push({
                id: stmt.getDataValue("id"),
                statement: stmt.getDataValue("statement"),
                answer: stmt.getDataValue("answer"),
                trueDescription: stmt.getDataValue("trueDescription"),
                falseDescription: stmt.getDataValue("falseDescription"),
                driverId: stmt.getDataValue("driverId"),
                driver,
                order: stmt.getDataValue("order"),
            });
        }
        const gameData = {
            id: game.getDataValue("id"),
            title: game.getDataValue("title"),
            date: game.getDataValue("date"),
            statements: statementsWithDrivers,
        };
        return res.status(200).json(gameData);
    }
    catch (error) {
        console.error("Error getting true or false game:", error);
        return res.status(500).json({ message: error });
    }
});
exports.getGameById = getGameById;
// Crear un nuevo juego TrueOrFalse
const createTrueOrFalseGame = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield (0, Users_1.getUserLogged)(req);
        if (!user || !(0, Users_1.isAdmin)(user)) {
            return res
                .status(401)
                .json({ message: "Unauthorized to create true or false game" });
        }
        const { title, date, statements } = req.body;
        // Validar los datos
        const validated = validateTrueOrFalseGame(title, date, statements);
        if (!validated) {
            return res.status(400).json({
                message: "Validation for parameters failed. Ensure all required fields are filled.",
            });
        }
        // Corregir el problema de zona horaria para la fecha
        let adjustedDate = date;
        if (date && typeof date === "string") {
            const dateParts = date.split("-");
            if (dateParts.length === 3) {
                const dateObj = new Date(Date.UTC(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]), 12, 0, 0));
                adjustedDate = dateObj.toISOString().split("T")[0];
            }
        }
        // Validar que existan todos los drivers
        for (const stmt of statements) {
            const driver = yield associations_1.Drivers.findByPk(stmt.driverId);
            if (!driver) {
                return res.status(404).json({
                    message: `Driver with ID ${stmt.driverId} not found`,
                });
            }
        }
        // Crear el juego
        const newGame = yield associations_1.TrueOrFalse.create({
            title,
            date: adjustedDate,
        });
        const gameID = newGame.getDataValue("id");
        // Crear los statements
        for (let i = 0; i < statements.length; i++) {
            const stmt = statements[i];
            yield associations_1.TrueOrFalse_Statements.create({
                gameID,
                statement: stmt.statement,
                answer: stmt.answer,
                trueDescription: stmt.trueDescription,
                falseDescription: stmt.falseDescription,
                driverId: stmt.driverId,
                order: i + 1,
            });
        }
        return res.status(200).json({
            message: "True or False game created successfully",
            gameId: gameID,
        });
    }
    catch (error) {
        console.error("Error creating true or false game:", error);
        return res.status(500).json({ message: error });
    }
});
exports.createTrueOrFalseGame = createTrueOrFalseGame;
// Actualizar un juego TrueOrFalse
const updateTrueOrFalseGame = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield (0, Users_1.getUserLogged)(req);
        if (!user || !(0, Users_1.isAdmin)(user)) {
            return res
                .status(401)
                .json({ message: "Unauthorized to update true or false game" });
        }
        const { id } = req.params;
        const { title, date, statements } = req.body;
        if (!id) {
            return res.status(400).json({ message: "Game ID is required" });
        }
        // Verificar que el juego existe
        const game = yield associations_1.TrueOrFalse.findByPk(id);
        if (!game) {
            return res.status(404).json({ message: "Game not found" });
        }
        // Validar los datos
        const validated = validateTrueOrFalseGame(title, date, statements);
        if (!validated) {
            return res.status(400).json({
                message: "Validation for parameters failed. Ensure all required fields are filled.",
            });
        }
        // Corregir el problema de zona horaria para la fecha
        let adjustedDate = date;
        if (date && typeof date === "string") {
            const dateParts = date.split("-");
            if (dateParts.length === 3) {
                const dateObj = new Date(Date.UTC(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]), 12, 0, 0));
                adjustedDate = dateObj.toISOString().split("T")[0];
            }
        }
        // Validar que existan todos los drivers
        for (const stmt of statements) {
            const driver = yield associations_1.Drivers.findByPk(stmt.driverId);
            if (!driver) {
                return res.status(404).json({
                    message: `Driver with ID ${stmt.driverId} not found`,
                });
            }
        }
        // Actualizar el juego
        yield associations_1.TrueOrFalse.update({
            title,
            date: adjustedDate,
        }, { where: { id } });
        // Eliminar statements existentes
        yield associations_1.TrueOrFalse_Statements.destroy({ where: { gameID: id } });
        // Crear nuevos statements
        for (let i = 0; i < statements.length; i++) {
            const stmt = statements[i];
            yield associations_1.TrueOrFalse_Statements.create({
                gameID: id,
                statement: stmt.statement,
                answer: stmt.answer,
                trueDescription: stmt.trueDescription,
                falseDescription: stmt.falseDescription,
                driverId: stmt.driverId,
                order: i + 1,
            });
        }
        return res.status(200).json({ message: "Game updated successfully" });
    }
    catch (error) {
        console.error("Error updating true or false game:", error);
        return res.status(500).json({ message: error });
    }
});
exports.updateTrueOrFalseGame = updateTrueOrFalseGame;
// Eliminar un juego TrueOrFalse
const deleteTrueOrFalseGame = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield (0, Users_1.getUserLogged)(req);
        if (!user || !(0, Users_1.isAdmin)(user)) {
            return res
                .status(401)
                .json({ message: "Unauthorized to delete true or false game" });
        }
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Game ID is required" });
        }
        const game = yield associations_1.TrueOrFalse.findByPk(id);
        if (!game) {
            return res.status(404).json({ message: "Game not found" });
        }
        // Eliminar statements asociados
        yield associations_1.TrueOrFalse_Statements.destroy({ where: { gameID: id } });
        // Eliminar el juego
        yield associations_1.TrueOrFalse.destroy({ where: { id } });
        return res.status(200).json({ message: "Game deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting true or false game:", error);
        return res.status(500).json({ message: error });
    }
});
exports.deleteTrueOrFalseGame = deleteTrueOrFalseGame;
