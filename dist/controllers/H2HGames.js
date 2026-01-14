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
exports.deleteH2HGame = exports.updateH2HGame = exports.createH2HGame = exports.getH2HGameById = exports.getAllH2HGames = void 0;
const associations_1 = require("../models/mysql/associations");
// Obtener todos los juegos H2H
const getAllH2HGames = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const games = yield associations_1.H2HGames.findAll({
            order: [["date", "DESC"]],
            include: [
                { model: associations_1.Teams },
                { model: associations_1.Drivers, as: "Driver1" },
                { model: associations_1.Drivers, as: "Driver2" },
            ],
        });
        return res.status(200).json(games);
    }
    catch (error) {
        console.error("Error getting H2H games:", error);
        return res.status(500).json({ message: error });
    }
});
exports.getAllH2HGames = getAllH2HGames;
// Obtener un juego H2H por ID
const getH2HGameById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Game ID is required" });
        }
        const game = yield associations_1.H2HGames.findByPk(id, {
            include: [
                { model: associations_1.Teams },
                { model: associations_1.Drivers, as: "Driver1" },
                { model: associations_1.Drivers, as: "Driver2" },
            ],
        });
        if (!game) {
            return res.status(404).json({ message: "Game not found" });
        }
        return res.status(200).json(game);
    }
    catch (error) {
        console.error("Error getting H2H game:", error);
        return res.status(500).json({ message: error });
    }
});
exports.getH2HGameById = getH2HGameById;
// Crear un nuevo juego H2H
const createH2HGame = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, date, year, team_id, driver1_id, driver2_id, total_races, qualifying_driver1, qualifying_driver2, race_driver1, race_driver2, points_driver1, points_driver2, dnf_driver1, dnf_driver2, points_finishes_driver1, points_finishes_driver2, } = req.body;
        // Validaciones básicas
        if (!title ||
            !date ||
            !year ||
            !team_id ||
            !driver1_id ||
            !driver2_id ||
            !total_races ||
            qualifying_driver1 === undefined ||
            qualifying_driver2 === undefined ||
            race_driver1 === undefined ||
            race_driver2 === undefined ||
            points_driver1 === undefined ||
            points_driver2 === undefined ||
            dnf_driver1 === undefined ||
            dnf_driver2 === undefined ||
            points_finishes_driver1 === undefined ||
            points_finishes_driver2 === undefined) {
            return res.status(400).json({ message: "All fields are required" });
        }
        // Validar que los pilotos existan
        const driver1 = yield associations_1.Drivers.findByPk(driver1_id);
        const driver2 = yield associations_1.Drivers.findByPk(driver2_id);
        const team = yield associations_1.Teams.findByPk(team_id);
        if (!driver1 || !driver2 || !team) {
            return res.status(404).json({ message: "Driver or team not found" });
        }
        // Validar que los valores sean coherentes con el total de carreras
        // Solo validamos que qualifying sume el total de carreras
        if (qualifying_driver1 + qualifying_driver2 !== total_races ||
            dnf_driver1 > total_races ||
            dnf_driver2 > total_races ||
            points_finishes_driver1 > total_races ||
            points_finishes_driver2 > total_races) {
            return res.status(400).json({
                message: "Values must add up correctly. Qualifying should add up to total races. Individual DNFs and points finishes should not exceed total races.",
            });
        }
        // Corregir el problema de zona horaria para la fecha
        let adjustedDate = date;
        if (date && typeof date === "string") {
            // Asegurarse de que la fecha se mantenga como la ingresada por el usuario
            const dateParts = date.split("-");
            if (dateParts.length === 3) {
                // Crear la fecha con la hora en UTC a las 12:00 para evitar problemas de zona horaria
                const dateObj = new Date(Date.UTC(parseInt(dateParts[0]), // año
                parseInt(dateParts[1]) - 1, // mes (0-11)
                parseInt(dateParts[2]), // día
                12, 0, 0 // mediodía UTC
                ));
                adjustedDate = dateObj.toISOString().split("T")[0]; // YYYY-MM-DD
            }
        }
        // Crear el juego
        const newGame = yield associations_1.H2HGames.create({
            title,
            date: adjustedDate,
            year,
            team_id,
            driver1_id,
            driver2_id,
            total_races,
            qualifying_driver1,
            qualifying_driver2,
            race_driver1,
            race_driver2,
            points_driver1,
            points_driver2,
            dnf_driver1,
            dnf_driver2,
            points_finishes_driver1,
            points_finishes_driver2,
        });
        return res.status(201).json({
            message: "H2H game created successfully",
            gameId: newGame.getDataValue("id"),
        });
    }
    catch (error) {
        console.error("Error creating H2H game:", error);
        return res.status(500).json({ message: error });
    }
});
exports.createH2HGame = createH2HGame;
// Actualizar un juego H2H
const updateH2HGame = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { title, date, year, team_id, driver1_id, driver2_id, total_races, qualifying_driver1, qualifying_driver2, race_driver1, race_driver2, points_driver1, points_driver2, dnf_driver1, dnf_driver2, points_finishes_driver1, points_finishes_driver2, } = req.body;
        if (!id) {
            return res.status(400).json({ message: "Game ID is required" });
        }
        // Verificar que el juego existe
        const game = yield associations_1.H2HGames.findByPk(id);
        if (!game) {
            return res.status(404).json({ message: "Game not found" });
        }
        // Validaciones básicas
        if (!title ||
            !date ||
            !year ||
            !team_id ||
            !driver1_id ||
            !driver2_id ||
            !total_races ||
            qualifying_driver1 === undefined ||
            qualifying_driver2 === undefined ||
            race_driver1 === undefined ||
            race_driver2 === undefined ||
            points_driver1 === undefined ||
            points_driver2 === undefined ||
            dnf_driver1 === undefined ||
            dnf_driver2 === undefined ||
            points_finishes_driver1 === undefined ||
            points_finishes_driver2 === undefined) {
            return res.status(400).json({ message: "All fields are required" });
        }
        // Validar que los pilotos existan
        const driver1 = yield associations_1.Drivers.findByPk(driver1_id);
        const driver2 = yield associations_1.Drivers.findByPk(driver2_id);
        const team = yield associations_1.Teams.findByPk(team_id);
        if (!driver1 || !driver2 || !team) {
            return res.status(404).json({ message: "Driver or team not found" });
        }
        // Validar que los valores sean coherentes con el total de carreras
        // Solo validamos que qualifying sume el total de carreras
        if (qualifying_driver1 + qualifying_driver2 !== total_races ||
            dnf_driver1 > total_races ||
            dnf_driver2 > total_races ||
            points_finishes_driver1 > total_races ||
            points_finishes_driver2 > total_races) {
            return res.status(400).json({
                message: "Values must add up correctly. Qualifying should add up to total races. Individual DNFs and points finishes should not exceed total races.",
            });
        }
        // Corregir el problema de zona horaria para la fecha
        let adjustedDate = date;
        if (date && typeof date === "string") {
            // Asegurarse de que la fecha se mantenga como la ingresada por el usuario
            const dateParts = date.split("-");
            if (dateParts.length === 3) {
                // Crear la fecha con la hora en UTC a las 12:00 para evitar problemas de zona horaria
                const dateObj = new Date(Date.UTC(parseInt(dateParts[0]), // año
                parseInt(dateParts[1]) - 1, // mes (0-11)
                parseInt(dateParts[2]), // día
                12, 0, 0 // mediodía UTC
                ));
                adjustedDate = dateObj.toISOString().split("T")[0]; // YYYY-MM-DD
            }
        }
        // Actualizar el juego
        yield associations_1.H2HGames.update({
            title,
            date: adjustedDate,
            year,
            team_id,
            driver1_id,
            driver2_id,
            total_races,
            qualifying_driver1,
            qualifying_driver2,
            race_driver1,
            race_driver2,
            points_driver1,
            points_driver2,
            dnf_driver1,
            dnf_driver2,
            points_finishes_driver1,
            points_finishes_driver2,
        }, { where: { id } });
        return res.status(200).json({ message: "Game updated successfully" });
    }
    catch (error) {
        console.error("Error updating H2H game:", error);
        return res.status(500).json({ message: error });
    }
});
exports.updateH2HGame = updateH2HGame;
// Eliminar un juego H2H
const deleteH2HGame = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Game ID is required" });
        }
        // Verificar que el juego existe
        const game = yield associations_1.H2HGames.findByPk(id);
        if (!game) {
            return res.status(404).json({ message: "Game not found" });
        }
        // Eliminar el juego
        yield associations_1.H2HGames.destroy({ where: { id } });
        return res.status(200).json({ message: "Game deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting H2H game:", error);
        return res.status(500).json({ message: error });
    }
});
exports.deleteH2HGame = deleteH2HGame;
