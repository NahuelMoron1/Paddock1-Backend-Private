import csv from "csv-parser";
import { Request, Response } from "express";
import * as fs from "fs";
import { Op } from "sequelize";
import {
  Drivers,
  Season_Teams_Drivers,
  Seasons,
  Teams,
} from "../models/mysql/associations";

interface CsvRow {
  id: string;
  seasonID: string;
  teamID: string;
  car_number: string;
  race_starts: string;
  laps_led: string;
  fastest_laps: string;
  poles: string;
  points: string;
  podiums: string;
  wins: string;
  standings: string;
  firstname: string;
  lastname: string;
}

export const getAllSeason_Teams_Drivers = async (
  req: Request,
  res: Response
) => {
  try {
    const season_tracks = await Season_Teams_Drivers.findAll({
      include: [
        {
          model: Seasons, // Incluye el equipo también si lo necesitas
          attributes: ["year"],
        },
        {
          model: Drivers, // Especifica el modelo que quieres incluir
          attributes: ["firstname", "lastname"],
        }, // Trae solo el campo 'driverName' de la tabla Drivers
        {
          model: Teams, // Incluye el equipo también si lo necesitas
          attributes: ["name"],
        },
      ],
    });

    if (!season_tracks) {
      return res.status(404).json({ message: "No season_tracks found" });
    }

    return res.json(season_tracks);
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

export const getBySeason_Teams_Drivers = async (
  req: Request,
  res: Response
) => {
  const { year } = req.params;

  const yearNumber = parseInt(year as string, 10);
  if (isNaN(yearNumber)) {
    return res
      .status(400)
      .json({ message: "Bad request: 'year' must be a number." });
  }

  try {
    const season = await Seasons.findOne({
      where: {
        year: yearNumber,
      },
      attributes: ["id"], // Solo necesitamos el ID para la siguiente consulta
    });

    if (!season) {
      return res
        .status(404)
        .json({ message: `No season found for year: ${yearNumber}` });
    }

    const season_drivers_data = await Season_Teams_Drivers.findAll({
      where: {
        seasonID: season.getDataValue("id"), // Filtra por el ID de la temporada encontrada
      },
      include: [
        {
          model: Drivers,
          attributes: ["firstname", "lastname"],
        },
        {
          model: Teams, // Incluye el equipo también si lo necesitas
          attributes: ["name"],
        },
      ],
    });

    if (!season_drivers_data) {
      return res.status(404).json({ message: "No season_tracks found" });
    }

    /*for (let i = 0; i < season_drivers_data.length; i++) {
      season_drivers_data[i].destroy();
    }*/

    console.log(season_drivers_data.length);

    return res.json(season_drivers_data);
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

export const createSeason = async (req: Request, res: Response) => {
  //TO DO 1996, 1995, 1994, 1991, 1990, 89, 88, 87, 86, 85, 84, 82, 81, 80, 79, 78, 76, 75, 74, 73, 72, 71, 70, 69, 68, 67, 65, 63,62,61,60,59
  const filePath = "../zSeasons/Season2001.csv"; // Asegúrate de que la ruta sea correcta
  //const filePath = "../stdLeft.csv"; // Asegúrate de que la ruta sea correcta
  readCsvData(filePath)
    .then(async (data) => {
      for (let i = 0; i < data.length; i++) {
        const std = await createData(data[i]);
        if (std) {
          await Season_Teams_Drivers.create(std);
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
  const driver = await Drivers.findOne({
    where: { firstname: data.firstname, lastname: data.lastname },
  });
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

  if (!driver || !team || !season) {
    console.log("MISSING!!!!!!!!!!!!!!!!");
    console.log("MISSING!!!!!!!!!!!!!!!!");
    console.log("MISSING!!!!!!!!!!!!!!!!");
    console.log("MISSING!!!!!!!!!!!!!!!!");
    console.log("MISSING!!!!!!!!!!!!!!!!");

    console.log(
      "NO INFO FOUND FOR ",
      data.firstname,
      " ",
      data.lastname,
      " AT TEAM ",
      data.teamID,
      " IN SEASON ",
      data.seasonID
    );

    if (!driver) {
      console.log("NO DRIVER");
    }

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
  const driverID = driver.getDataValue("id");
  const car_number = data.car_number;
  const race_starts = data.race_starts;
  const laps_led = data.laps_led;
  const fastest_laps = data.fastest_laps;
  const poles = data.poles;
  const points = data.points;
  const podiums = data.podiums;
  const wins = data.wins;
  const standings = data.standings;

  const std = {
    seasonID,
    teamID,
    driverID,
    car_number,
    race_starts,
    laps_led,
    fastest_laps,
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
