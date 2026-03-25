import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

import {
  Drivers,
  GuessTeams,
  Seasons,
  Teams,
} from "../models/mysql/associations";
import { getUserLogged, isAdmin } from "./Users";

export const createGuessTeamGame = async (req: Request, res: Response) => {
  try {
    const user = await getUserLogged(req);
    if (!user || !isAdmin(user)) {
      return res
        .status(401)
        .json({ message: "Unauthorized to create guess team game" });
    }

    const results = req.body;

    if (!results || !results.newGame) {
      return res
        .status(400)
        .json({ message: "Not all fields contains a value" });
    }

    const newGameParams = results.newGame;

    const isValid = await validateGuessTeamParams(newGameParams);

    if (!isValid) {
      return res
        .status(400)
        .json({ message: "Some parameters are not as expected" });
    }

    const newGame = {
      id: uuidv4(),
      date: newGameParams.date,
      team_id: newGameParams.team_id,
      team_principal: newGameParams.team_principal,
      tp_flag: newGameParams.tp_flag,
      driver1_id: newGameParams.driver1_id,
      driver2_id: newGameParams.driver2_id,
      season_id: newGameParams.season_id,
    };
    await GuessTeams.create(newGame);

    return res.status(200).json({ message: "Game created successfully" });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

export const getAllGuessTeams = async (req: Request, res: Response) => {
  try {
    const user = await getUserLogged(req);
    if (!user || !isAdmin(user)) {
      return res
        .status(401)
        .json({ message: "Unauthorized to get all guess teams" });
    }

    const allGames = await GuessTeams.findAll({
      include: [
        { model: Teams, attributes: ["id", "name"] },
        {
          model: Drivers,
          as: "Driver1",
          attributes: ["id", "firstname", "lastname"],
        },
        {
          model: Drivers,
          as: "Driver2",
          attributes: ["id", "firstname", "lastname"],
        },
        { model: Seasons, attributes: ["id", "year"] },
      ],
    });

    if (!allGames || allGames.length === 0) {
      return res.status(404).json({ message: "No guess teams found" });
    }

    return res.status(200).json(allGames);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const getGuessTeamByID = async (req: Request, res: Response) => {
  try {
    const user = await getUserLogged(req);
    if (!user || !isAdmin(user)) {
      return res
        .status(401)
        .json({ message: "Unauthorized to get guess team by ID" });
    }

    const { gameID } = req.params;
    if (!gameID) {
      return res.status(400).json({ message: "No ID Provided" });
    }

    const game = await GuessTeams.findByPk(gameID, {
      include: [
        { model: Teams, attributes: ["id", "name"] },
        {
          model: Drivers,
          as: "driver1",
          attributes: ["id", "firstname", "lastname"],
        },
        {
          model: Drivers,
          as: "driver2",
          attributes: ["id", "firstname", "lastname"],
        },
        { model: Seasons, attributes: ["id", "year"] },
      ],
    });

    if (!game) {
      return res.status(404).json({ message: "No guess team found" });
    }

    return res.status(200).json(game);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const updateGuessTeam = async (req: Request, res: Response) => {
  try {
    const user = await getUserLogged(req);
    if (!user || !isAdmin(user)) {
      return res
        .status(401)
        .json({ message: "Unauthorized to update guess team" });
    }

    const { gameID } = req.params;
    if (!gameID) {
      return res.status(400).json({ message: "No ID Provided" });
    }

    const results = req.body;
    if (!results || !results.updatedGame) {
      return res
        .status(400)
        .json({ message: "Not all fields contains a value" });
    }

    const updatedGameParams = results.updatedGame;

    const isValid = await validateGuessTeamParams(updatedGameParams);
    if (!isValid) {
      return res
        .status(400)
        .json({ message: "Some parameters are not as expected" });
    }

    const game = await GuessTeams.findByPk(gameID);
    if (!game) {
      return res.status(404).json({ message: "No guess team found" });
    }

    await game.update({
      date: updatedGameParams.date,
      team_id: updatedGameParams.team_id,
      team_principal: updatedGameParams.team_principal,
      tp_flag: updatedGameParams.tp_flag,
      driver1_id: updatedGameParams.driver1_id,
      driver2_id: updatedGameParams.driver2_id,
      season_id: updatedGameParams.season_id,
    });

    return res.status(200).json({ message: "Game updated successfully" });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

export const deleteGuessTeam = async (req: Request, res: Response) => {
  try {
    const user = await getUserLogged(req);
    if (!user || !isAdmin(user)) {
      return res
        .status(401)
        .json({ message: "Unauthorized to delete guess team" });
    }

    const { gameID } = req.params;
    if (!gameID) {
      return res.status(400).json({ message: "No ID Provided" });
    }

    const game = await GuessTeams.findByPk(gameID);
    if (!game) {
      return res.status(404).json({ message: "No guess team found" });
    }

    await game.destroy();

    return res.status(200).json({ message: "Game deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

async function validateGuessTeamParams(results: any) {
  if (
    !results.date ||
    !results.team_id ||
    !results.team_principal ||
    !results.tp_flag ||
    !results.driver1_id ||
    !results.driver2_id ||
    !results.season_id
  ) {
    return false;
  }

  if (
    typeof results.date !== "string" ||
    typeof results.team_id !== "string" ||
    typeof results.team_principal !== "string" ||
    typeof results.tp_flag !== "string" ||
    typeof results.driver1_id !== "string" ||
    typeof results.driver2_id !== "string" ||
    typeof results.season_id !== "string"
  ) {
    return false;
  }

  const driver1 = await Drivers.findByPk(results.driver1_id);
  const driver2 = await Drivers.findByPk(results.driver2_id);
  const season = await Seasons.findByPk(results.season_id);
  const team = await Teams.findByPk(results.team_id);

  if (!driver1 || !driver2 || !season || !team) {
    return false;
  }

  return true;
}
