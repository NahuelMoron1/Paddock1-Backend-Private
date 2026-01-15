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
import { getUserLogged, isAdmin } from "./Users";

// Archivo para guardar el progreso del procesamiento
const PROGRESS_FILE = path.join(__dirname, "../../../drivers_progress.json");

// Función para cargar el progreso guardado
function loadProgress(): { processed: string[]; remaining: string[] } {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      const data = fs.readFileSync(PROGRESS_FILE, "utf8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error loading progress file:", error);
  }
  return { processed: [], remaining: [] };
}

// Función para guardar el progreso
function saveProgress(processed: string[], remaining: string[]): void {
  try {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify({ processed, remaining }));
  } catch (error) {
    console.error("Error saving progress file:", error);
  }
}

export const removeBackgroundForImages = async (
  req: Request,
  res: Response
) => {
  try {
    // Path to the drivers folder (one level up from server)
    const driversPath = path.join(__dirname, "../../../drivers");

    // Cargar progreso anterior si existe
    let progress = loadProgress();
    let processedFiles = progress.processed || [];

    // Read all files from the drivers directory
    const files = fs.readdirSync(driversPath);

    // Filter for image files (assuming jpg/jpeg/png)
    const imageFiles = files.filter((file) => /\.(jpg|jpeg|png)$/i.test(file));

    if (imageFiles.length === 0) {
      return res
        .status(400)
        .json({ message: "No image files found in drivers folder" });
    }

    // Filtrar archivos ya procesados
    const remainingFiles = imageFiles.filter(
      (file) => !processedFiles.includes(file)
    );

    if (remainingFiles.length === 0) {
      return res.status(200).json({
        message: "All images have been processed already",
        processed: processedFiles.length,
        remaining: 0,
      });
    }

    const results = [];
    const errors = [];
    const MAX_IMAGES = 10; // Límite de 10 imágenes por ejecución para evitar límites de API

    // Process each image file (up to MAX_IMAGES)
    for (let i = 0; i < Math.min(remainingFiles.length, MAX_IMAGES); i++) {
      const fileName = remainingFiles[i];
      try {
        const filePath = path.join(driversPath, fileName);
        const fileBuffer = fs.readFileSync(filePath);

        // Create a file-like object that removeBackground can process
        const fileObj = {
          buffer: fileBuffer,
          originalname: fileName,
        } as Express.Multer.File;

        // Remove background
        const imageWithoutBg = await removeBackground(fileObj);
        if (!imageWithoutBg) {
          errors.push({ file: fileName, error: "Error removing background" });
          continue;
        }

        // Save processed image
        const url = postImage(imageWithoutBg, fileName);
        console.log(`Processed ${fileName}, saved to: ${url}`);
        results.push({ file: fileName, url });

        // Añadir a la lista de procesados
        processedFiles.push(fileName);

        // Eliminar la imagen original después de procesarla correctamente
        try {
          fs.unlinkSync(filePath);
          console.log(`Deleted original file: ${fileName}`);
        } catch (deleteErr) {
          console.error(`Error deleting original file ${fileName}:`, deleteErr);
          // No añadimos esto a los errores porque el procesamiento fue exitoso
        }
      } catch (err) {
        console.error(`Error processing ${fileName}:`, err);
        errors.push({ file: fileName, error: err });
        // No eliminamos la imagen original si hubo un error en el procesamiento
      }

      // Guardar progreso después de cada imagen para evitar pérdidas
      saveProgress(processedFiles, remainingFiles.slice(i + 1));
    }

    // Guardar progreso final de esta ejecución
    saveProgress(
      processedFiles,
      remainingFiles.slice(Math.min(remainingFiles.length, MAX_IMAGES))
    );

    // Información sobre imágenes restantes
    const remainingImagesCount =
      remainingFiles.length - Math.min(remainingFiles.length, MAX_IMAGES);

    return res.status(200).json({
      message: `Processed ${results.length} images, with ${errors.length} errors. ${remainingImagesCount} images remaining.`,
      processed: results,
      errors: errors,
      total_processed: processedFiles.length,
      remainingImages: remainingImagesCount,
    });
  } catch (error) {
    console.error("Error in batch processing:", error);
    return res.status(500).json({ message: error });
  }
};

// Obtener todos los juegos de impostor
export const getAllImpostorGames = async (req: Request, res: Response) => {
  try {
    const user = await getUserLogged(req);
    if (!user || !isAdmin(user)) {
      return res
        .status(401)
        .json({ message: "Unauthorized to get all impostor games" });
    }

    const games = await Impostors.findAll({
      order: [["date", "DESC"]],
    });

    return res.status(200).json(games);
  } catch (error) {
    console.error("Error getting impostor games:", error);
    return res.status(500).json({ message: error });
  }
};

// Obtener un juego específico por ID con sus resultados
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

    const game = await Impostors.findByPk(id);

    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    // Obtener impostores y inocentes
    const results = await Impostors_Results.findAll({
      where: { gameID: id },
    });

    const impostors: any[] = [];
    const innocents: any[] = [];

    for (const result of results) {
      const isImpostor = result.getDataValue("isImpostor");
      const resultID = result.getDataValue("resultID");

      let entity;
      const type = game.getDataValue("type");

      if (type === "driver") {
        entity = await Drivers.findByPk(resultID);
      } else if (type === "team") {
        entity = await Teams.findByPk(resultID);
      } else if (type === "track") {
        entity = await Tracks.findByPk(resultID);
      }

      if (entity) {
        const resultObj: any = {};

        if (type === "driver") {
          resultObj.driver = entity;
        } else if (type === "team") {
          resultObj.team = entity;
        } else if (type === "track") {
          resultObj.track = entity;
        }

        if (isImpostor) {
          impostors.push(resultObj);
        } else {
          innocents.push(resultObj);
        }
      }
    }

    const gameData = {
      id: game.getDataValue("id"),
      title: game.getDataValue("title"),
      date: game.getDataValue("date"),
      type: game.getDataValue("type"),
      amount_impostors: game.getDataValue("amount_impostors"),
      amount_innocents: game.getDataValue("amount_innocents"),
      impostors,
      innocents,
    };

    return res.status(200).json(gameData);
  } catch (error) {
    console.error("Error getting impostor game:", error);
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
        .json({ message: "Unauthorized to update impostor game" });
    }

    const { id } = req.params;
    const {
      title,
      date,
      amount_impostors,
      amount_innocents,
      impostors,
      innocents,
      type,
    } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Game ID is required" });
    }

    // Verificar que el juego existe
    const game = await Impostors.findByPk(id);

    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    // Validar los datos
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

    // Corregir el problema de zona horaria para la fecha
    let adjustedDate = date;
    if (date && typeof date === "string") {
      // Asegurarse de que la fecha se mantenga como la ingresada por el usuario
      const dateParts = date.split("-");
      if (dateParts.length === 3) {
        // Crear la fecha con la hora en UTC a las 12:00 para evitar problemas de zona horaria
        const dateObj = new Date(
          Date.UTC(
            parseInt(dateParts[0]), // año
            parseInt(dateParts[1]) - 1, // mes (0-11)
            parseInt(dateParts[2]), // día
            12,
            0,
            0 // mediodía UTC
          )
        );
        adjustedDate = dateObj.toISOString().split("T")[0]; // YYYY-MM-DD
      }
    }

    // Actualizar el juego
    await Impostors.update(
      {
        title,
        date: adjustedDate,
        amount_impostors,
        amount_innocents,
        type,
      },
      { where: { id } }
    );

    // Eliminar resultados existentes
    await Impostors_Results.destroy({ where: { gameID: id } });

    // Crear nuevos resultados
    const impostorResults: any[] = createImpostorResults(
      impostors,
      innocents,
      type,
      id
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

    return res.status(200).json({ message: "Game updated successfully" });
  } catch (error) {
    console.error("Error updating impostor game:", error);
    return res.status(500).json({ message: error });
  }
};

export const createImpostorGame = async (req: Request, res: Response) => {
  try {
    const user = await getUserLogged(req);
    if (!user || !isAdmin(user)) {
      return res
        .status(401)
        .json({ message: "Unauthorized to create impostor game" });
    }

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

    // Corregir el problema de zona horaria para la fecha
    let adjustedDate = date;
    if (date && typeof date === "string") {
      // Asegurarse de que la fecha se mantenga como la ingresada por el usuario
      const dateParts = date.split("-");
      if (dateParts.length === 3) {
        // Crear la fecha con la hora en UTC a las 12:00 para evitar problemas de zona horaria
        const dateObj = new Date(
          Date.UTC(
            parseInt(dateParts[0]), // año
            parseInt(dateParts[1]) - 1, // mes (0-11)
            parseInt(dateParts[2]), // día
            12,
            0,
            0 // mediodía UTC
          )
        );
        adjustedDate = dateObj.toISOString().split("T")[0]; // YYYY-MM-DD
      }
    }

    const impostorGame = {
      title: title,
      date: adjustedDate,
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

    return res.status(200).json({
      message: "Impostor game created successfully",
      gameId: gameID,
    });
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

// API keys para servicios de eliminación de fondos (rotar si se alcanza el límite)
const REMOVE_BG_API_KEYS = [
  "bi8UFJaED5QXAPrXmYNwmFc3", // Clave original
  "kAswswSZTQMJPDXPz2qNQb9P", // Segunda clave
  "6oQf7SLkKvNPxQpVDnPGsUJP", // Tercera clave (puedes añadir más)
];

// Índice para la rotación de API keys
let currentKeyIndex = 0;

// Función para obtener la siguiente API key
function getNextApiKey(): string {
  const key = REMOVE_BG_API_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % REMOVE_BG_API_KEYS.length;
  return key;
}

// Función que utiliza la API de remove.bg para eliminar el fondo
async function removeBackground(
  file: Express.Multer.File
): Promise<Buffer | null> {
  const formData = new FormData();
  formData.append("image_file", file.buffer, { filename: file.originalname });
  formData.append("size", "auto");

  // Intentar hasta 3 veces con diferentes API keys si hay error
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const apiKey = getNextApiKey();
      console.log(
        `Intento ${attempt + 1} con API key: ${apiKey.substring(0, 5)}...`
      );

      const response = await axios.post(
        "https://api.remove.bg/v1.0/removebg",
        formData,
        {
          headers: {
            "X-Api-Key": apiKey,
            ...formData.getHeaders(),
          },
          responseType: "arraybuffer", // Devuelve la imagen en binario
        }
      );

      // Verificar si la respuesta es un error (a veces viene como JSON)
      if (response.headers["content-type"]?.includes("application/json")) {
        const errorText = Buffer.from(response.data).toString("utf8");
        if (errorText.includes("error")) {
          console.log(`Error en API: ${errorText}`);
          continue; // Probar con la siguiente API key
        }
      }

      return Buffer.from(response.data); // Retorna la imagen procesada como buffer
    } catch (error: any) {
      console.error(`Error con API key ${attempt + 1}:`, error.message);

      // Si es el último intento, fallar
      if (attempt === 2) {
        console.error(
          "Todos los intentos fallaron. Usando procesamiento local como respaldo."
        );

        // Usar Sharp como respaldo
        try {
          const sharp = require("sharp");
          return await sharp(file.buffer)
            .png()
            .trim()
            .resize({
              width: 800,
              height: 800,
              fit: "inside",
              withoutEnlargement: true,
            })
            .toBuffer();
        } catch (sharpError) {
          console.error("Error con procesamiento local:", sharpError);
          return null;
        }
      }
    }
  }

  return null;
}

export const postImage = (
  file: Express.Multer.File | Buffer,
  originalName?: string
): string | undefined => {
  if (!file) return undefined;

  // Asegurarse de que la carpeta de destino existe
  const uploadDir = path.join("uploads/drivers");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Generar un nombre de archivo consistente
  const fileName = originalName || `image_${Date.now()}.png`;
  const uploadPath = path.join(uploadDir, fileName);

  try {
    // Si `file` es un Buffer (imagen procesada), lo guarda como un archivo
    if (file instanceof Buffer) {
      fs.writeFileSync(uploadPath, file as unknown as Uint8Array);
    } else {
      // Si es un archivo Multer, guarda el buffer
      fs.writeFileSync(uploadPath, file.buffer as unknown as Uint8Array);
    }

    console.log(`Imagen guardada exitosamente en: ${uploadPath}`);
    return uploadPath;
  } catch (error) {
    console.error(`Error guardando la imagen en ${uploadPath}:`, error);
    return undefined;
  }
};
