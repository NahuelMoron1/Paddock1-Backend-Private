import axios from "axios";
import { Request, Response } from "express";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import { col, fn, literal, Model, Op } from "sequelize";
import {
  Impostors,
  Impostors_Results,
  Season_Teams,
  Season_Teams_Drivers,
  Season_Tracks,
  Seasons,
  Tracks,
} from "../models/mysql/associations";
import Drivers from "../models/mysql/Drivers";
import Teams from "../models/mysql/Teams";

export const removeBackgroundForImages = async (
  req: Request,
  res: Response
) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "No file" });
    }
    const imageWithoutBg = await removeBackground(file);
    if (!imageWithoutBg) {
      return res.status(500).json({ message: "Error removing background" });
    }
    const url = postImage(imageWithoutBg, file.originalname);
    console.log("URL: ", url);

    return res.status(200).json({ message: "saved" });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const playNormalGame = async (req: Request, res: Response) => {
  try {
    const { IDs, gameID } = req.body;

    const challenge = await Impostors.findByPk(gameID);
    if (!challenge) {
      return res.status(404).json({ message: "No challenge found" });
    }

    if (
      !Array.isArray(IDs) ||
      !IDs.every((id: any) => typeof id === "string") ||
      !gameID ||
      typeof gameID !== "string"
    ) {
      return res
        .status(400)
        .json({ message: "An error happened on normal mode impostor game" });
    }

    let impostorIDsSelected: string[] = [];
    let innocentsIDsSelected: string[] = [];

    const allResults = await Impostors_Results.findAll({
      where: { gameID: gameID },
    });

    const allInnocents = allResults
      .filter((r) => r.getDataValue("isImpostor") !== true)
      .map((r) => r.getDataValue("resultID"));

    for (let id of IDs) {
      const result = await Impostors_Results.findOne({
        where: { gameID: gameID, resultID: id },
      });

      if (result && result.getDataValue("isImpostor") === true) {
        impostorIDsSelected.push(id);
      } else if (result && result.getDataValue("isImpostor") !== true) {
        innocentsIDsSelected.push(id);
      }
    }

    const gameWon =
      impostorIDsSelected.length === 0 &&
      innocentsIDsSelected.length ===
        challenge.getDataValue("amount_innocents");

    return res.status(200).json({
      game_won: gameWon,
      impostors_selected: impostorIDsSelected,
      innocents_selected: innocentsIDsSelected,
      all_innocents: allInnocents,
    });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const playOneByOneGame = async (req: Request, res: Response) => {};

export const getGameData = async (req: Request, res: Response) => {
  try {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    const challenge = await Impostors.findOne({
      where: { date: today },
    });

    if (!challenge) {
      return res
        .status(404)
        .json({ message: "No impostor challenge found for today" });
    }

    const players = await Impostors_Results.findAll({
      where: { gameID: challenge.getDataValue("id") },
    });

    if (!players) {
      return res
        .status(404)
        .json({ message: "No results found for this impostor challenge" });
    }

    const id = challenge.getDataValue("id");
    const title = challenge.getDataValue("title");
    const type = challenge.getDataValue("type");
    const results = await getResults(players, type);
    console.log("RESULTS: ", results);

    return res.status(200).json({
      id: id,
      title: title,
      type: type,
      results: results,
    });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

async function getResults(results: Model<any, any>[], type: string) {
  switch (type) {
    case "driver":
      const driverResults: any[] = [];
      for (let result of results) {
        const driverAux = await Drivers.findByPk(
          result.getDataValue("resultID")
        );

        if (driverAux) {
          driverResults.push(driverAux);
        }
      }
      return driverResults;
    case "team":
      const teamResults: any[] = [];
      for (let result of results) {
        const driverAux = await Drivers.findByPk(
          result.getDataValue("resultID")
        );

        if (driverAux) {
          teamResults.push(driverAux);
        }
      }

      return teamResults;
    case "track":
      const trackResults: any[] = [];
      for (let result of results) {
        const driverAux = await Drivers.findByPk(
          result.getDataValue("resultID")
        );

        if (driverAux) {
          trackResults.push(driverAux);
        }
      }

      return trackResults;
  }
}

export const createImpostorGame = async (req: Request, res: Response) => {
  try {
    const {
      title,
      date,
      amount_impostors,
      amount_innocents,
      impostors,
      innocents,
      type,
    } = req.body;

    const validated = validateImpostorGame(
      title,
      date,
      amount_impostors,
      amount_innocents,
      impostors,
      innocents,
      type
    );

    if (!validated) {
      return res
        .status(400)
        .json({ message: "Validation for parameters failed" });
    }

    const impostorGame = {
      title: title,
      date: date,
      amount_impostors: amount_impostors,
      amount_innocents: amount_innocents,
      type: type,
    };

    const createdGame = await Impostors.create(impostorGame);
    const gameID = createdGame.getDataValue("id");

    const impostorResults: any[] = createImpostorResults(
      impostors,
      innocents,
      type,
      gameID
    );

    if (impostorResults.length <= 0) {
      return res.status(500).json({
        message:
          "Something went wrong by adding impostor results. Please contact support",
      });
    }

    for (let result of impostorResults) {
      await Impostors_Results.create(result);
    }

    return res
      .status(200)
      .json({ message: "Impostor game created successfully" });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

function createImpostorResults(
  impostors: any[],
  innocents: any[],
  type: string,
  gameID: string
) {
  let impostorResults: any[] = [];

  for (let impostor of impostors) {
    switch (type) {
      case "driver":
        const driverResult = {
          gameID: gameID,
          resultID: impostor.driver?.id,
          isImpostor: true,
        };
        impostorResults.push(driverResult);
        break;
      case "team":
        const teamResult = {
          gameID: gameID,
          resultID: impostor.team?.id,
          isImpostor: true,
        };
        impostorResults.push(teamResult);
        break;
      case "track":
        const trackResult = {
          gameID: gameID,
          resultID: impostor.track?.id,
          isImpostor: true,
        };
        impostorResults.push(trackResult);
        break;
      default:
        break;
    }
  }

  for (let innocent of innocents) {
    switch (type) {
      case "driver":
        const driverResult = {
          gameID: gameID,
          resultID: innocent.driver?.id,
          isImpostor: false,
        };
        impostorResults.push(driverResult);
        break;
      case "team":
        const teamResult = {
          gameID: gameID,
          resultID: innocent.team?.id,
          isImpostor: false,
        };
        impostorResults.push(teamResult);
        break;
      case "track":
        const trackResult = {
          gameID: gameID,
          resultID: innocent.track?.id,
          isImpostor: false,
        };
        impostorResults.push(trackResult);
        break;
      default:
        break;
    }
  }

  return impostorResults;
}

function validateImpostorGame(
  title: any,
  date: any,
  amount_impostors: any,
  amount_innocents: any,
  impostors: any,
  innocents: any,
  type: any
) {
  if (
    !title ||
    typeof title !== "string" ||
    !date ||
    typeof date !== "string" ||
    !amount_impostors ||
    typeof amount_impostors !== "number" ||
    !amount_innocents ||
    typeof amount_innocents !== "number" ||
    !type ||
    typeof type !== "string"
  ) {
    console.log(1);

    return false;
  }

  switch (type) {
    case "driver":
      break;
    case "team":
      break;
    case "track":
      break;
    default:
      console.log(2);

      return false;
  }

  if (
    impostors.length !== amount_impostors ||
    innocents.length !== amount_innocents
  ) {
    console.log(3);

    return false;
  }

  return true;
}

function validateAddImpostor(
  type: any,
  year: any,
  fromYear: any,
  toYear: any,
  nationality: any,
  stat: any,
  condition: any,
  value: any,
  isImpostor: any
) {
  if (
    !type ||
    typeof type !== "string" ||
    !stat ||
    typeof stat !== "string" ||
    !condition ||
    typeof condition !== "string" ||
    !value ||
    typeof value !== "number" ||
    typeof isImpostor !== "boolean"
  ) {
    return false;
  }

  if (!year && (!fromYear || !toYear)) {
    return false;
  }

  if (nationality && typeof nationality !== "string") {
    return false;
  }
  return true;
}

export const findCandidates = async (req: Request, res: Response) => {
  try {
    const {
      type,
      year,
      fromYear,
      toYear,
      nationality,
      stat,
      condition,
      value,
      isImpostor,
    } = req.body;

    const validated = validateAddImpostor(
      type,
      year,
      fromYear,
      toYear,
      nationality,
      stat,
      condition,
      value,
      isImpostor
    );
    if (!validated) {
      return res.status(400).json({
        message: "Validation for parameters on adding impostor failed",
      });
    }

    const whereCondition: any = {};

    if (nationality) {
      whereCondition.nationality = nationality;
    }

    if (year) {
      whereCondition.year = year.toString();
    } else if (fromYear && toYear) {
      whereCondition.year = {
        [Op.between]: [fromYear.toString(), toYear.toString()],
      };
    }
    let impostor = false;
    if (isImpostor && typeof isImpostor === "boolean") {
      impostor = isImpostor;
    }
    switch (type) {
      case "driver":
        const drivers = await findByDrivers(
          year,
          nationality,
          fromYear,
          toYear,
          stat,
          condition,
          value,
          impostor
        );
        return res.status(200).json(drivers);
      case "team":
        const teams = await findByTeams(
          year,
          fromYear,
          toYear,
          stat,
          condition,
          value,
          impostor
        );
        return res.status(200).json(teams);
      case "track":
        const tracks = await findByTracks(
          year,
          fromYear,
          toYear,
          stat,
          condition,
          value,
          impostor,
          1
        );
        return res.status(200).json(tracks);
    }
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

async function findByDrivers(
  year: string,
  nationality: string,
  fromYear: string,
  toYear: string,
  stat: string,
  condition: string,
  value: string,
  isImpostor: boolean
) {
  const operatorMap: Record<string, string> = {
    ">": "<=",
    "<": ">=",
    "=": "!=",
    ">=": "<",
    "<=": ">",
  };

  const effectiveCondition = isImpostor ? operatorMap[condition] : condition;
  const havingClause = literal(`SUM(${stat}) ${effectiveCondition} ${value}`);

  const results = await Season_Teams_Drivers.findAll({
    include: [
      {
        model: Drivers,
        attributes: ["id", "firstname", "lastname", "nationality", "image"],
        ...(nationality && { where: { nationality } }),
      },
      {
        model: Seasons,
        attributes: [],
        where: year
          ? { year: year.toString() }
          : fromYear && toYear
          ? { year: { [Op.between]: [fromYear.toString(), toYear.toString()] } }
          : undefined,
      },
    ],
    attributes: ["driverID", [fn("SUM", col(stat)), "totalStat"]],
    group: ["driverID", "Driver.id"],
    order: [[literal("totalStat"), "DESC"]],
    having: havingClause,
  });

  return results
    .map((r: any) => ({
      driver: r.Driver,
      totalStat: r.getDataValue("totalStat"),
    }))
    .filter((d: any) => d);
}

async function findByTeams(
  year: string,
  fromYear: string,
  toYear: string,
  stat: string,
  condition: string,
  value: string,
  isImpostor: boolean
) {
  const operatorMap: Record<string, string> = {
    ">": "<=",
    "<": ">=",
    "=": "!=",
    ">=": "<",
    "<=": ">",
  };

  const effectiveCondition = isImpostor ? operatorMap[condition] : condition;
  const havingClause = literal(`SUM(${stat}) ${effectiveCondition} ${value}`);

  const results = await Season_Teams.findAll({
    include: [
      {
        model: Teams,
        attributes: [
          "id",
          "name",
          "common_name",
          "championships",
          "base",
          "logo",
        ],
      },
      {
        model: Seasons,
        attributes: [],
        where: year
          ? { year: year.toString() }
          : fromYear && toYear
          ? { year: { [Op.between]: [fromYear.toString(), toYear.toString()] } }
          : undefined,
      },
    ],
    attributes: ["teamID", [fn("SUM", col(stat)), "totalStat"]],
    group: ["teamID", "Team.id"],
    order: [[literal("totalStat"), "DESC"]],
    having: havingClause,
  });

  return results
    .map((r: any) => ({
      team: r.Team,
      totalStat: r.getDataValue("totalStat"),
    }))
    .filter((d: any) => d);
}

async function findByTracks(
  year: string,
  fromYear: string,
  toYear: string,
  stat: string,
  condition: string,
  value: string,
  isImpostor: boolean,
  length: number
) {
  const operatorMap: Record<string, string> = {
    ">": "<=",
    "<": ">=",
    "=": "!=",
    ">=": "<",
    "<=": ">",
  };

  const effectiveCondition = isImpostor ? operatorMap[condition] : condition;
  const havingClause = literal(`SUM(${stat}) ${effectiveCondition} ${value}`);

  const results = await Season_Tracks.findAll({
    include: [
      {
        model: Tracks,
        attributes: [
          "id",
          "location",
          "track_name",
          "length",
          "country",
          "image",
        ],
      },
      {
        model: Seasons,
        attributes: [],
        where: year
          ? { year: year.toString() }
          : fromYear && toYear
          ? { year: { [Op.between]: [fromYear.toString(), toYear.toString()] } }
          : undefined,
      },
    ],
    attributes: ["teamID", [fn("SUM", col(stat)), "totalStat"]],
    group: ["teamID", "Team.id"],
    order: [[literal("totalStat"), "DESC"]],
    having: havingClause,
  });

  return results
    .map((r: any) => ({
      track: r.Track,
      totalStat: r.getDataValue("totalStat"),
    }))
    .filter((d: any) => d);
}

const REMOVE_BG_API_KEY = "8h7vtT5EomgjNXiSFm4xQGWs"; // Reemplázala con tu API key

async function removeBackground(
  file: Express.Multer.File
): Promise<Buffer | null> {
  const formData = new FormData();
  formData.append("image_file", file.buffer, { filename: file.originalname });
  formData.append("size", "auto");

  try {
    const response = await axios.post(
      "https://api.remove.bg/v1.0/removebg",
      formData,
      {
        headers: {
          "X-Api-Key": REMOVE_BG_API_KEY,
          ...formData.getHeaders(),
        },
        responseType: "arraybuffer", // Devuelve la imagen en binario
      }
    );

    return Buffer.from(response.data); // Retorna la imagen procesada como buffer
  } catch (error) {
    console.error("Error removiendo el fondo:", error);
    return null;
  }
}

export const postImage = (
  file: Express.Multer.File | Buffer,
  originalName?: string
): string | undefined => {
  if (!file) return undefined;

  const uploadPath = path.join("uploads/drivers", originalName!);

  // 🔹 Si `file` es un Buffer (imagen procesada), lo guarda como un archivo
  if (file instanceof Buffer) {
    fs.writeFileSync(uploadPath, file as Uint8Array); // si es Buffer directo
  } else {
    // 🔹 Si es un archivo Multer, guarda el buffer
    fs.writeFileSync(uploadPath, file.buffer as Uint8Array); // si es Multer
  }

  return uploadPath;
};
