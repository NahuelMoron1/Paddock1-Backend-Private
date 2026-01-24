import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

import {
  Drivers,
  GuessCareers,
  GuessCareers_Teams,
  Teams,
} from "../models/mysql/associations";
import { getUserLogged, isAdmin } from "./Users";

// Obtener todos los juegos de GuessCareers
export const getAllGuessCareersGames = async (req: Request, res: Response) => {
  try {
    const user = await getUserLogged(req);
    if (!user || !isAdmin(user)) {
      return res
        .status(401)
        .json({ message: "Unauthorized to get all guess careers games" });
    }

    const games = await GuessCareers.findAll({
      include: [
        {
          model: Drivers,
          attributes: ["id", "firstname", "lastname", "nationality", "image"],
        },
      ],
      order: [["date", "DESC"]],
    });

    // Obtener los equipos para cada juego
    const gamesWithTeams = await Promise.all(games.map(async (game) => {
      const gameId = game.getDataValue("id");
      
      // Obtener los equipos asociados al juego
      const teamsData = await GuessCareers_Teams.findAll({
        where: { game_id: gameId },
        include: [
          {
            model: Teams,
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
    }));

    return res.status(200).json(gamesWithTeams);
  } catch (error) {
    console.error("Error getting guess careers games:", error);
    return res.status(500).json({ message: error });
  }
};

// Obtener un juego específico por ID con sus equipos
export const getGameById = async (req: Request, res: Response) => {
  try {
    const user = await getUserLogged(req);
    if (!user || !isAdmin(user)) {
      return res
        .status(401)
        .json({ message: "Unauthorized to get game by ID" });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Game ID is required" });
    }

    const game = await GuessCareers.findByPk(id, {
      include: [
        {
          model: Drivers,
          attributes: ["id", "firstname", "lastname", "nationality", "image"],
        },
      ],
    });

    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    // Obtener los equipos asociados al juego
    const teamsData = await GuessCareers_Teams.findAll({
      where: { game_id: id },
      include: [
        {
          model: Teams,
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
  } catch (error) {
    console.error("Error getting guess careers game:", error);
    return res.status(500).json({ message: error });
  }
};

// Crear un nuevo juego de GuessCareers
export const createGuessCareersGame = async (req: Request, res: Response) => {
  try {
    const user = await getUserLogged(req);
    if (!user || !isAdmin(user)) {
      return res
        .status(401)
        .json({ message: "Unauthorized to create guess careers game" });
    }

    const { date, driver_id, teams } = req.body;

    // Validar los datos
    const validated = await validateGuessCareersGame(date, driver_id, teams);
    if (!validated) {
      return res
        .status(400)
        .json({ message: "Validation for parameters failed" });
    }

    // Crear el juego - guardamos la fecha tal como viene
    const gameId = uuidv4();
    const newGame = {
      id: gameId,
      date: date, // Guardamos la fecha directamente como string
      driver_id,
    };

    await GuessCareers.create(newGame);

    // Crear los equipos asociados al juego
    for (let i = 0; i < teams.length; i++) {
      const teamData = teams[i];
      await GuessCareers_Teams.create({
        id: uuidv4(),
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
  } catch (error) {
    console.error("Error creating guess careers game:", error);
    return res.status(500).json({ message: error });
  }
};

// Actualizar un juego existente
export const updateGame = async (req: Request, res: Response) => {
  try {
    const user = await getUserLogged(req);
    if (!user || !isAdmin(user)) {
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
    const game = await GuessCareers.findByPk(id);
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    // Validar los datos
    const validated = await validateGuessCareersGame(date, driver_id, teams);
    if (!validated) {
      return res
        .status(400)
        .json({ message: "Validation for parameters failed" });
    }

    // Actualizar el juego - guardamos la fecha tal como viene
    await GuessCareers.update(
      {
        date: date, // Guardamos la fecha directamente como string
        driver_id,
      },
      { where: { id } }
    );

    // Eliminar los equipos asociados existentes
    await GuessCareers_Teams.destroy({ where: { game_id: id } });

    // Crear los nuevos equipos asociados
    for (let i = 0; i < teams.length; i++) {
      const teamData = teams[i];
      await GuessCareers_Teams.create({
        id: uuidv4(),
        game_id: id,
        team_id: typeof teamData === 'object' ? teamData.id : teamData,
        ordered: i + 1, // El orden empieza desde 1
        start_year: typeof teamData === 'object' ? teamData.start_year : null,
        end_year: typeof teamData === 'object' ? teamData.end_year : null,
      });
    }

    return res.status(200).json({ message: "Game updated successfully" });
  } catch (error) {
    console.error("Error updating guess careers game:", error);
    return res.status(500).json({ message: error });
  }
};

// Eliminar un juego
export const deleteGame = async (req: Request, res: Response) => {
  try {
    const user = await getUserLogged(req);
    if (!user || !isAdmin(user)) {
      return res
        .status(401)
        .json({ message: "Unauthorized to delete guess careers game" });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Game ID is required" });
    }

    // Verificar que el juego existe
    const game = await GuessCareers.findByPk(id);
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    // Eliminar los equipos asociados
    await GuessCareers_Teams.destroy({ where: { game_id: id } });

    // Eliminar el juego
    await GuessCareers.destroy({ where: { id } });

    return res.status(200).json({ message: "Game deleted successfully" });
  } catch (error) {
    console.error("Error deleting guess careers game:", error);
    return res.status(500).json({ message: error });
  }
};

// Función de validación para los parámetros del juego
async function validateGuessCareersGame(
  date: string,
  driver_id: string,
  teams: any[]
) {
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
  const driver = await Drivers.findByPk(driver_id);
  if (!driver) {
    return false;
  }

  // Verificar que todos los equipos existen
  for (const teamData of teams) {
    const teamId = typeof teamData === 'object' ? teamData.id : teamData;
    
    if (typeof teamId !== "string") {
      return false;
    }

    const team = await Teams.findByPk(teamId);
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
}