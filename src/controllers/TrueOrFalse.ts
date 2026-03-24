import { Request, Response } from "express";
import {
  Drivers,
  TrueOrFalse,
  TrueOrFalse_Statements,
} from "../models/mysql/associations";
import { getUserLogged, isAdmin } from "./Users";

// Validación básica de datos del juego
const validateTrueOrFalseGame = (
  title: string,
  date: string,
  statements: any[],
): boolean => {
  if (
    !title ||
    !date ||
    !Array.isArray(statements) ||
    statements.length === 0
  ) {
    return false;
  }

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    if (
      !stmt.statement ||
      stmt.answer === undefined ||
      !stmt.trueDescription ||
      !stmt.driverId
    ) {
      return false;
    }
    if (stmt.answer === false && !stmt.falseDescription) {
      return false;
    }
  }

  return true;
};

// Obtener todos los juegos TrueOrFalse
export const getAllTrueOrFalseGames = async (req: Request, res: Response) => {
  try {
    const user = await getUserLogged(req);
    if (!user || !isAdmin(user)) {
      return res
        .status(401)
        .json({ message: "Unauthorized to get all true or false games" });
    }

    const games = await TrueOrFalse.findAll({
      order: [["date", "DESC"]],
    });

    return res.status(200).json(games);
  } catch (error) {
    console.error("Error getting true or false games:", error);
    return res.status(500).json({ message: error });
  }
};

// Obtener un juego específico por ID con sus statements
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

    const game = await TrueOrFalse.findByPk(id);

    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    // Obtener todos los statements del juego
    const statements = await TrueOrFalse_Statements.findAll({
      where: { gameID: id },
      order: [["order", "ASC"]],
    });

    const statementsWithDrivers: any[] = [];

    for (const stmt of statements) {
      const driver = await Drivers.findByPk(stmt.getDataValue("driverId"));

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
  } catch (error) {
    console.error("Error getting true or false game:", error);
    return res.status(500).json({ message: error });
  }
};

// Crear un nuevo juego TrueOrFalse
export const createTrueOrFalseGame = async (req: Request, res: Response) => {
  try {
    const user = await getUserLogged(req);
    if (!user || !isAdmin(user)) {
      return res
        .status(401)
        .json({ message: "Unauthorized to create true or false game" });
    }

    const { title, date, statements } = req.body;

    // Validar los datos
    const validated = validateTrueOrFalseGame(title, date, statements);

    if (!validated) {
      return res.status(400).json({
        message:
          "Validation for parameters failed. Ensure all required fields are filled.",
      });
    }

    // Corregir el problema de zona horaria para la fecha
    let adjustedDate = date;
    if (date && typeof date === "string") {
      const dateParts = date.split("-");
      if (dateParts.length === 3) {
        const dateObj = new Date(
          Date.UTC(
            parseInt(dateParts[0]),
            parseInt(dateParts[1]) - 1,
            parseInt(dateParts[2]),
            12,
            0,
            0,
          ),
        );
        adjustedDate = dateObj.toISOString().split("T")[0];
      }
    }

    // Validar que existan todos los drivers
    for (const stmt of statements) {
      const driver = await Drivers.findByPk(stmt.driverId);
      if (!driver) {
        return res.status(404).json({
          message: `Driver with ID ${stmt.driverId} not found`,
        });
      }
    }

    // Crear el juego
    const newGame = await TrueOrFalse.create({
      title,
      date: adjustedDate,
    });

    const gameID = newGame.getDataValue("id");

    // Crear los statements
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      await TrueOrFalse_Statements.create({
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
  } catch (error) {
    console.error("Error creating true or false game:", error);
    return res.status(500).json({ message: error });
  }
};

// Actualizar un juego TrueOrFalse
export const updateTrueOrFalseGame = async (req: Request, res: Response) => {
  try {
    const user = await getUserLogged(req);
    if (!user || !isAdmin(user)) {
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
    const game = await TrueOrFalse.findByPk(id);

    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    // Validar los datos
    const validated = validateTrueOrFalseGame(title, date, statements);

    if (!validated) {
      return res.status(400).json({
        message:
          "Validation for parameters failed. Ensure all required fields are filled.",
      });
    }

    // Corregir el problema de zona horaria para la fecha
    let adjustedDate = date;
    if (date && typeof date === "string") {
      const dateParts = date.split("-");
      if (dateParts.length === 3) {
        const dateObj = new Date(
          Date.UTC(
            parseInt(dateParts[0]),
            parseInt(dateParts[1]) - 1,
            parseInt(dateParts[2]),
            12,
            0,
            0,
          ),
        );
        adjustedDate = dateObj.toISOString().split("T")[0];
      }
    }

    // Validar que existan todos los drivers
    for (const stmt of statements) {
      const driver = await Drivers.findByPk(stmt.driverId);
      if (!driver) {
        return res.status(404).json({
          message: `Driver with ID ${stmt.driverId} not found`,
        });
      }
    }

    // Actualizar el juego
    await TrueOrFalse.update(
      {
        title,
        date: adjustedDate,
      },
      { where: { id } },
    );

    // Eliminar statements existentes
    await TrueOrFalse_Statements.destroy({ where: { gameID: id } });

    // Crear nuevos statements
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      await TrueOrFalse_Statements.create({
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
  } catch (error) {
    console.error("Error updating true or false game:", error);
    return res.status(500).json({ message: error });
  }
};

// Eliminar un juego TrueOrFalse
export const deleteTrueOrFalseGame = async (req: Request, res: Response) => {
  try {
    const user = await getUserLogged(req);
    if (!user || !isAdmin(user)) {
      return res
        .status(401)
        .json({ message: "Unauthorized to delete true or false game" });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Game ID is required" });
    }

    const game = await TrueOrFalse.findByPk(id);

    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    // Eliminar statements asociados
    await TrueOrFalse_Statements.destroy({ where: { gameID: id } });

    // Eliminar el juego
    await TrueOrFalse.destroy({ where: { id } });

    return res.status(200).json({ message: "Game deleted successfully" });
  } catch (error) {
    console.error("Error deleting true or false game:", error);
    return res.status(500).json({ message: error });
  }
};
