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
exports.deleteGame = exports.updateGame = exports.createGuessCareersGame = exports.getGameById = exports.getAllGuessCareersGames = void 0;
const uuid_1 = require("uuid");
const associations_1 = require("../models/mysql/associations");
const Users_1 = require("./Users");
// Obtener todos los juegos de GuessCareers
const getAllGuessCareersGames = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield (0, Users_1.getUserLogged)(req);
        if (!user || !(0, Users_1.isAdmin)(user)) {
            return res
                .status(401)
                .json({ message: "Unauthorized to get all guess careers games" });
        }
        const games = yield associations_1.GuessCareers.findAll({
            include: [
                {
                    model: associations_1.Drivers,
                    attributes: ["id", "firstname", "lastname", "nationality", "image"],
                },
            ],
            order: [["date", "DESC"]],
        });
        // Obtener los equipos para cada juego
        const gamesWithTeams = yield Promise.all(games.map((game) => __awaiter(void 0, void 0, void 0, function* () {
            const gameId = game.getDataValue("id");
            // Obtener los equipos asociados al juego
            const teamsData = yield associations_1.GuessCareers_Teams.findAll({
                where: { game_id: gameId },
                include: [
                    {
                        model: associations_1.Teams,
                        attributes: ["id", "name", "common_name", "logo"],
                    },
                ],
                order: [["ordered", "ASC"]],
            });
            const teams = teamsData.map((teamData) => ({
                id: teamData.getDataValue("id"),
                team: teamData.getDataValue("Team"),
                ordered: teamData.getDataValue("ordered"),
                start_year: teamData.getDataValue("start_year"),
                end_year: teamData.getDataValue("end_year"),
            }));
            return {
                id: game.getDataValue("id"),
                date: game.getDataValue("date"),
                driver_id: game.getDataValue("driver_id"),
                Driver: game.getDataValue("Driver"),
                Teams: teams
            };
        })));
        return res.status(200).json(gamesWithTeams);
    }
    catch (error) {
        console.error("Error getting guess careers games:", error);
        return res.status(500).json({ message: error });
    }
});
exports.getAllGuessCareersGames = getAllGuessCareersGames;
// Obtener un juego específico por ID con sus equipos
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
        const game = yield associations_1.GuessCareers.findByPk(id, {
            include: [
                {
                    model: associations_1.Drivers,
                    attributes: ["id", "firstname", "lastname", "nationality", "image"],
                },
            ],
        });
        if (!game) {
            return res.status(404).json({ message: "Game not found" });
        }
        // Obtener los equipos asociados al juego
        const teamsData = yield associations_1.GuessCareers_Teams.findAll({
            where: { game_id: id },
            include: [
                {
                    model: associations_1.Teams,
                    attributes: ["id", "name", "common_name", "logo"],
                },
            ],
            order: [["ordered", "ASC"]],
        });
        const teams = teamsData.map((teamData) => ({
            id: teamData.getDataValue("id"),
            team: teamData.getDataValue("Team"),
            ordered: teamData.getDataValue("ordered"),
            start_year: teamData.getDataValue("start_year"),
            end_year: teamData.getDataValue("end_year"),
        }));
        const gameData = {
            id: game.getDataValue("id"),
            date: game.getDataValue("date"),
            Driver: game.getDataValue("Driver"),
            Teams: teams,
        };
        return res.status(200).json(gameData);
    }
    catch (error) {
        console.error("Error getting guess careers game:", error);
        return res.status(500).json({ message: error });
    }
});
exports.getGameById = getGameById;
// Crear un nuevo juego de GuessCareers
const createGuessCareersGame = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield (0, Users_1.getUserLogged)(req);
        if (!user || !(0, Users_1.isAdmin)(user)) {
            return res
                .status(401)
                .json({ message: "Unauthorized to create guess careers game" });
        }
        const { date, driver_id, teams } = req.body;
        // Validar los datos
        const validated = yield validateGuessCareersGame(date, driver_id, teams);
        if (!validated) {
            return res
                .status(400)
                .json({ message: "Validation for parameters failed" });
        }
        // Crear el juego - guardamos la fecha tal como viene
        const gameId = (0, uuid_1.v4)();
        const newGame = {
            id: gameId,
            date: date, // Guardamos la fecha directamente como string
            driver_id,
        };
        yield associations_1.GuessCareers.create(newGame);
        // Crear los equipos asociados al juego
        for (let i = 0; i < teams.length; i++) {
            const teamData = teams[i];
            yield associations_1.GuessCareers_Teams.create({
                id: (0, uuid_1.v4)(),
                game_id: gameId,
                team_id: typeof teamData === 'object' ? teamData.id : teamData,
                ordered: i + 1, // El orden empieza desde 1
                start_year: typeof teamData === 'object' ? teamData.start_year : null,
                end_year: typeof teamData === 'object' ? teamData.end_year : null,
            });
        }
        return res.status(200).json({
            message: "Guess careers game created successfully",
            gameId,
        });
    }
    catch (error) {
        console.error("Error creating guess careers game:", error);
        return res.status(500).json({ message: error });
    }
});
exports.createGuessCareersGame = createGuessCareersGame;
// Actualizar un juego existente
const updateGame = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield (0, Users_1.getUserLogged)(req);
        if (!user || !(0, Users_1.isAdmin)(user)) {
            return res
                .status(401)
                .json({ message: "Unauthorized to update guess careers game" });
        }
        const { id } = req.params;
        const { date, driver_id, teams } = req.body;
        if (!id) {
            return res.status(400).json({ message: "Game ID is required" });
        }
        // Verificar que el juego existe
        const game = yield associations_1.GuessCareers.findByPk(id);
        if (!game) {
            return res.status(404).json({ message: "Game not found" });
        }
        // Validar los datos
        const validated = yield validateGuessCareersGame(date, driver_id, teams);
        if (!validated) {
            return res
                .status(400)
                .json({ message: "Validation for parameters failed" });
        }
        // Actualizar el juego - guardamos la fecha tal como viene
        yield associations_1.GuessCareers.update({
            date: date, // Guardamos la fecha directamente como string
            driver_id,
        }, { where: { id } });
        // Eliminar los equipos asociados existentes
        yield associations_1.GuessCareers_Teams.destroy({ where: { game_id: id } });
        // Crear los nuevos equipos asociados
        for (let i = 0; i < teams.length; i++) {
            const teamData = teams[i];
            yield associations_1.GuessCareers_Teams.create({
                id: (0, uuid_1.v4)(),
                game_id: id,
                team_id: typeof teamData === 'object' ? teamData.id : teamData,
                ordered: i + 1, // El orden empieza desde 1
                start_year: typeof teamData === 'object' ? teamData.start_year : null,
                end_year: typeof teamData === 'object' ? teamData.end_year : null,
            });
        }
        return res.status(200).json({ message: "Game updated successfully" });
    }
    catch (error) {
        console.error("Error updating guess careers game:", error);
        return res.status(500).json({ message: error });
    }
});
exports.updateGame = updateGame;
// Eliminar un juego
const deleteGame = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield (0, Users_1.getUserLogged)(req);
        if (!user || !(0, Users_1.isAdmin)(user)) {
            return res
                .status(401)
                .json({ message: "Unauthorized to delete guess careers game" });
        }
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Game ID is required" });
        }
        // Verificar que el juego existe
        const game = yield associations_1.GuessCareers.findByPk(id);
        if (!game) {
            return res.status(404).json({ message: "Game not found" });
        }
        // Eliminar los equipos asociados
        yield associations_1.GuessCareers_Teams.destroy({ where: { game_id: id } });
        // Eliminar el juego
        yield associations_1.GuessCareers.destroy({ where: { id } });
        return res.status(200).json({ message: "Game deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting guess careers game:", error);
        return res.status(500).json({ message: error });
    }
});
exports.deleteGame = deleteGame;
// Función de validación para los parámetros del juego
function validateGuessCareersGame(date, driver_id, teams) {
    return __awaiter(this, void 0, void 0, function* () {
        // Verificar que los parámetros básicos existen
        if (!date || !driver_id || !teams || !Array.isArray(teams) || teams.length === 0) {
            return false;
        }
        // Verificar que la fecha es una cadena
        if (typeof date !== "string") {
            return false;
        }
        // Verificar que el ID del piloto es una cadena
        if (typeof driver_id !== "string") {
            return false;
        }
        // Verificar que el piloto existe
        const driver = yield associations_1.Drivers.findByPk(driver_id);
        if (!driver) {
            return false;
        }
        // Verificar que todos los equipos existen
        for (const teamData of teams) {
            const teamId = typeof teamData === 'object' ? teamData.id : teamData;
            if (typeof teamId !== "string") {
                return false;
            }
            const team = yield associations_1.Teams.findByPk(teamId);
            if (!team) {
                return false;
            }
            // Validar años si están presentes
            if (typeof teamData === 'object') {
                if (teamData.start_year && isNaN(Number(teamData.start_year))) {
                    return false;
                }
                if (teamData.end_year && isNaN(Number(teamData.end_year))) {
                    return false;
                }
            }
        }
        return true;
    });
}
