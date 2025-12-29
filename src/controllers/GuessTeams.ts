import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

import {
  Drivers,
  GuessTeams,
  Seasons,
  Teams,
} from "../models/mysql/associations";

export const createGuessTeamGame = async (req: Request, res: Response) => {
  try {
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
