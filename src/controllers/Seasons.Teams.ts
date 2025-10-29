import csv from "csv-parser";
import { Request, Response } from "express";
import * as fs from "fs";
import { Op } from "sequelize";
import { Season_Teams, Seasons, Teams } from "../models/mysql/associations";

interface CsvRow {
  id: string;
  seasonID: string;
  teamID: string;
  chassis: string;
  engine: string;
  poles: string;
  points: string;
  podiums: string;
  wins: string;
  standings: string;
  firstname: string;
  lastname: string;
}

export const getAllSeason_teams = async (req: Request, res: Response) => {
  try {
    const season_teams = await Season_Teams.findAll();

    if (!season_teams) {
      return res.status(404).json({ message: "No season_teams found" });
    }

    return res.json(season_teams);
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

export const deleteSeason_team = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Bad request" });
    }

    const season_team = await Season_Teams.findByPk(id);

    if (!season_team) {
      return res
        .status(404)
        .json({ message: "No season_teams found to delete" });
    }

    await season_team.destroy();

    return res.status(200).json({ message: "Successfully deleted" });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

export const addSeason_teams = async (req: Request, res: Response) => {
  try {
    const {
      seasonID,
      teamID,
      chassis,
      engine,
      poles,
      points,
      podiums,
      wins,
      standings,
    } = req.body;

    const validated = validateSeasonTeams(
      seasonID,
      teamID,
      chassis,
      engine,
      poles,
      points,
      podiums,
      wins,
      standings
    );

    if (!validated) {
      return res.status(400).json({ message: "Bad request" });
    }

    const season_teams = {
      seasonID,
      teamID,
      chassis,
      engine,
      poles,
      points,
      podiums,
      wins,
      standings,
    };
    await Season_Teams.create(season_teams);
    return res.status(200).json({
      message: `Successfully added a season_team`,
    });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

export const modifySeason_teams = async (req: Request, res: Response) => {
  try {
    const newSeason_team = req.body;

    if (!newSeason_team) {
      return res.status(400).json({ message: "Bad request" });
    }

    const validated = validateSeasonTeams(
      newSeason_team.seasonID,
      newSeason_team.teamID,
      newSeason_team.chassis,
      newSeason_team.engine,
      newSeason_team.poles,
      newSeason_team.points,
      newSeason_team.podiums,
      newSeason_team.wins,
      newSeason_team.standings
    );

    if (!newSeason_team.id || !validated) {
      return res
        .status(400)
        .json({ message: "Not all fields contains a value" });
    }

    await Season_Teams.update(
      {
        seasonID: newSeason_team.seasonID,
        teamID: newSeason_team.teamID,
        chassis: newSeason_team.chassis,
        engine: newSeason_team.engine,
        poles: newSeason_team.poles,
        points: newSeason_team.points,
        podiums: newSeason_team.podiums,
        wins: newSeason_team.wins,
        standings: newSeason_team.standings,
      },
      { where: { id: newSeason_team.id } }
    );
    return res.status(200).json({
      message: `Successfully updated the season_team ${newSeason_team.id}`,
    });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

function validateSeasonTeams(
  seasonID: string,
  teamID: string,
  chassis: string,
  engine: string,
  poles: number,
  points: number,
  podiums: number,
  wins: number,
  standings: number
) {
  if (!seasonID || !teamID || !chassis || !engine || !standings) {
    return false;
  }
  if (
    (poles && typeof poles !== "number") ||
    (points && typeof points !== "number") ||
    (podiums && typeof podiums !== "number") ||
    (wins && typeof wins !== "number") ||
    !standings ||
    typeof standings !== "number"
  ) {
    return false;
  }
  return true;
}

export const createSeason = async (req: Request, res: Response) => {
  //TO DO 1996, 1995, 1994, 1991, 1990, 89, 88, 87, 86, 85, 84, 82, 81, 80, 79, 78, 76, 75, 74, 73, 72, 71, 70, 69, 68, 67, 65, 63,62,61,60,59
  const filePath = "../zSeasonsTeams/Season2022.csv"; // Asegúrate de que la ruta sea correcta
  //const filePath = "../stdLeft.csv"; // Asegúrate de que la ruta sea correcta
  readCsvData(filePath)
    .then(async (data) => {
      for (let i = 0; i < data.length; i++) {
        const std = await createData(data[i]);
        if (std) {
          await Season_Teams.create(std);
        }
      }
      return res.status(200).json({ message: `File ${filePath} Saved!` });
    })
    .catch((error) => {
      console.error("No se pudo procesar el archivo CSV:", error);
      return res.status(500).json({ message: "Failed, check console" });
    });
};

async function createData(data: CsvRow) {
  const season = await Seasons.findOne({
    where: { year: data.seasonID },
  });
  const team = await Teams.findOne({
    where: {
      name: {
        [Op.regexp]: `\\b${data.teamID.toLowerCase()}\\b`,
      },
    },
  });

  if (!team || !season) {
    console.log("MISSING!!!!!!!!!!!!!!!!");
    console.log("MISSING!!!!!!!!!!!!!!!!");
    console.log("MISSING!!!!!!!!!!!!!!!!");
    console.log("MISSING!!!!!!!!!!!!!!!!");
    console.log("MISSING!!!!!!!!!!!!!!!!");

    console.log(" AT TEAM ", data.teamID, " IN SEASON ", data.seasonID);

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
  const chassis = data.chassis;
  const engine = data.engine;
  const poles = data.poles;
  const points = data.points;
  const podiums = data.podiums;
  const wins = data.wins;
  const standings = data.standings;

  const std = {
    seasonID,
    teamID,
    chassis,
    engine,
    poles,
    points,
    podiums,
    wins,
    standings,
  };

  return std;
}

export const readCsvData = (filePath: string): Promise<CsvRow[]> => {
  return new Promise((resolve, reject) => {
    const results: CsvRow[] = [];
    fs.createReadStream(filePath)
      .pipe(csv({ separator: "," })) // El separador de tu archivo es la coma
      .on("data", (data: CsvRow) => results.push(data))
      .on("end", () => {
        console.log(`Archivo ${filePath} leído exitosamente.`);
        resolve(results);
      })
      .on("error", (error: any) => {
        console.error(`Error al leer el archivo ${filePath}:`, error);
        reject(error);
      });
  });
};
