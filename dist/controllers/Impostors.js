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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postImage = exports.findCandidates = exports.createImpostorGame = exports.updateGame = exports.getGameById = exports.getAllImpostorGames = exports.getGameData = exports.playOneByOneGame = exports.playNormalGame = exports.removeBackgroundForImages = void 0;
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sequelize_1 = require("sequelize");
const associations_1 = require("../models/mysql/associations");
const Drivers_1 = __importDefault(require("../models/mysql/Drivers"));
const Teams_1 = __importDefault(require("../models/mysql/Teams"));
// Archivo para guardar el progreso del procesamiento
const PROGRESS_FILE = path_1.default.join(__dirname, "../../../drivers_progress.json");
// Función para cargar el progreso guardado
function loadProgress() {
    try {
        if (fs_1.default.existsSync(PROGRESS_FILE)) {
            const data = fs_1.default.readFileSync(PROGRESS_FILE, "utf8");
            return JSON.parse(data);
        }
    }
    catch (error) {
        console.error("Error loading progress file:", error);
    }
    return { processed: [], remaining: [] };
}
// Función para guardar el progreso
function saveProgress(processed, remaining) {
    try {
        fs_1.default.writeFileSync(PROGRESS_FILE, JSON.stringify({ processed, remaining }));
    }
    catch (error) {
        console.error("Error saving progress file:", error);
    }
}
const removeBackgroundForImages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Path to the drivers folder (one level up from server)
        const driversPath = path_1.default.join(__dirname, "../../../drivers");
        // Cargar progreso anterior si existe
        let progress = loadProgress();
        let processedFiles = progress.processed || [];
        // Read all files from the drivers directory
        const files = fs_1.default.readdirSync(driversPath);
        // Filter for image files (assuming jpg/jpeg/png)
        const imageFiles = files.filter((file) => /\.(jpg|jpeg|png)$/i.test(file));
        if (imageFiles.length === 0) {
            return res
                .status(400)
                .json({ message: "No image files found in drivers folder" });
        }
        // Filtrar archivos ya procesados
        const remainingFiles = imageFiles.filter((file) => !processedFiles.includes(file));
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
                const filePath = path_1.default.join(driversPath, fileName);
                const fileBuffer = fs_1.default.readFileSync(filePath);
                // Create a file-like object that removeBackground can process
                const fileObj = {
                    buffer: fileBuffer,
                    originalname: fileName,
                };
                // Remove background
                const imageWithoutBg = yield removeBackground(fileObj);
                if (!imageWithoutBg) {
                    errors.push({ file: fileName, error: "Error removing background" });
                    continue;
                }
                // Save processed image
                const url = (0, exports.postImage)(imageWithoutBg, fileName);
                console.log(`Processed ${fileName}, saved to: ${url}`);
                results.push({ file: fileName, url });
                // Añadir a la lista de procesados
                processedFiles.push(fileName);
                // Eliminar la imagen original después de procesarla correctamente
                try {
                    fs_1.default.unlinkSync(filePath);
                    console.log(`Deleted original file: ${fileName}`);
                }
                catch (deleteErr) {
                    console.error(`Error deleting original file ${fileName}:`, deleteErr);
                    // No añadimos esto a los errores porque el procesamiento fue exitoso
                }
            }
            catch (err) {
                console.error(`Error processing ${fileName}:`, err);
                errors.push({ file: fileName, error: err });
                // No eliminamos la imagen original si hubo un error en el procesamiento
            }
            // Guardar progreso después de cada imagen para evitar pérdidas
            saveProgress(processedFiles, remainingFiles.slice(i + 1));
        }
        // Guardar progreso final de esta ejecución
        saveProgress(processedFiles, remainingFiles.slice(Math.min(remainingFiles.length, MAX_IMAGES)));
        // Información sobre imágenes restantes
        const remainingImagesCount = remainingFiles.length - Math.min(remainingFiles.length, MAX_IMAGES);
        return res.status(200).json({
            message: `Processed ${results.length} images, with ${errors.length} errors. ${remainingImagesCount} images remaining.`,
            processed: results,
            errors: errors,
            total_processed: processedFiles.length,
            remainingImages: remainingImagesCount,
        });
    }
    catch (error) {
        console.error("Error in batch processing:", error);
        return res.status(500).json({ message: error });
    }
});
exports.removeBackgroundForImages = removeBackgroundForImages;
const playNormalGame = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { IDs, gameID } = req.body;
        const challenge = yield associations_1.Impostors.findByPk(gameID);
        if (!challenge) {
            return res.status(404).json({ message: "No challenge found" });
        }
        if (!Array.isArray(IDs) ||
            !IDs.every((id) => typeof id === "string") ||
            !gameID ||
            typeof gameID !== "string") {
            return res
                .status(400)
                .json({ message: "An error happened on normal mode impostor game" });
        }
        let impostorIDsSelected = [];
        let innocentsIDsSelected = [];
        const allResults = yield associations_1.Impostors_Results.findAll({
            where: { gameID: gameID },
        });
        const allInnocents = allResults
            .filter((r) => r.getDataValue("isImpostor") !== true)
            .map((r) => r.getDataValue("resultID"));
        for (let id of IDs) {
            const result = yield associations_1.Impostors_Results.findOne({
                where: { gameID: gameID, resultID: id },
            });
            if (result && result.getDataValue("isImpostor") === true) {
                impostorIDsSelected.push(id);
            }
            else if (result && result.getDataValue("isImpostor") !== true) {
                innocentsIDsSelected.push(id);
            }
        }
        const gameWon = impostorIDsSelected.length === 0 &&
            innocentsIDsSelected.length ===
                challenge.getDataValue("amount_innocents");
        return res.status(200).json({
            game_won: gameWon,
            impostors_selected: impostorIDsSelected,
            innocents_selected: innocentsIDsSelected,
            all_innocents: allInnocents,
        });
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.playNormalGame = playNormalGame;
const playOneByOneGame = (req, res) => __awaiter(void 0, void 0, void 0, function* () { });
exports.playOneByOneGame = playOneByOneGame;
const getGameData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
        const challenge = yield associations_1.Impostors.findOne({
            where: { date: today },
        });
        if (!challenge) {
            return res
                .status(404)
                .json({ message: "No impostor challenge found for today" });
        }
        const players = yield associations_1.Impostors_Results.findAll({
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
        const results = yield getResults(players, type);
        console.log("RESULTS: ", results);
        return res.status(200).json({
            id: id,
            title: title,
            type: type,
            results: results,
        });
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.getGameData = getGameData;
// Obtener todos los juegos de impostor
const getAllImpostorGames = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const games = yield associations_1.Impostors.findAll({
            order: [["date", "DESC"]],
        });
        return res.status(200).json(games);
    }
    catch (error) {
        console.error("Error getting impostor games:", error);
        return res.status(500).json({ message: error });
    }
});
exports.getAllImpostorGames = getAllImpostorGames;
// Obtener un juego específico por ID con sus resultados
const getGameById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Game ID is required" });
        }
        const game = yield associations_1.Impostors.findByPk(id);
        if (!game) {
            return res.status(404).json({ message: "Game not found" });
        }
        // Obtener impostores y inocentes
        const results = yield associations_1.Impostors_Results.findAll({
            where: { gameID: id },
        });
        const impostors = [];
        const innocents = [];
        for (const result of results) {
            const isImpostor = result.getDataValue("isImpostor");
            const resultID = result.getDataValue("resultID");
            let entity;
            const type = game.getDataValue("type");
            if (type === "driver") {
                entity = yield Drivers_1.default.findByPk(resultID);
            }
            else if (type === "team") {
                entity = yield Teams_1.default.findByPk(resultID);
            }
            else if (type === "track") {
                entity = yield associations_1.Tracks.findByPk(resultID);
            }
            if (entity) {
                const resultObj = {};
                if (type === "driver") {
                    resultObj.driver = entity;
                }
                else if (type === "team") {
                    resultObj.team = entity;
                }
                else if (type === "track") {
                    resultObj.track = entity;
                }
                if (isImpostor) {
                    impostors.push(resultObj);
                }
                else {
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
    }
    catch (error) {
        console.error("Error getting impostor game:", error);
        return res.status(500).json({ message: error });
    }
});
exports.getGameById = getGameById;
// Actualizar un juego existente
const updateGame = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { title, date, amount_impostors, amount_innocents, impostors, innocents, type, } = req.body;
        if (!id) {
            return res.status(400).json({ message: "Game ID is required" });
        }
        // Verificar que el juego existe
        const game = yield associations_1.Impostors.findByPk(id);
        if (!game) {
            return res.status(404).json({ message: "Game not found" });
        }
        // Validar los datos
        const validated = validateImpostorGame(title, date, amount_impostors, amount_innocents, impostors, innocents, type);
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
                const dateObj = new Date(Date.UTC(parseInt(dateParts[0]), // año
                parseInt(dateParts[1]) - 1, // mes (0-11)
                parseInt(dateParts[2]), // día
                12, 0, 0 // mediodía UTC
                ));
                adjustedDate = dateObj.toISOString().split("T")[0]; // YYYY-MM-DD
            }
        }
        // Actualizar el juego
        yield associations_1.Impostors.update({
            title,
            date: adjustedDate,
            amount_impostors,
            amount_innocents,
            type,
        }, { where: { id } });
        // Eliminar resultados existentes
        yield associations_1.Impostors_Results.destroy({ where: { gameID: id } });
        // Crear nuevos resultados
        const impostorResults = createImpostorResults(impostors, innocents, type, id);
        if (impostorResults.length <= 0) {
            return res.status(500).json({
                message: "Something went wrong by adding impostor results. Please contact support",
            });
        }
        for (let result of impostorResults) {
            yield associations_1.Impostors_Results.create(result);
        }
        return res.status(200).json({ message: "Game updated successfully" });
    }
    catch (error) {
        console.error("Error updating impostor game:", error);
        return res.status(500).json({ message: error });
    }
});
exports.updateGame = updateGame;
function getResults(results, type) {
    return __awaiter(this, void 0, void 0, function* () {
        switch (type) {
            case "driver":
                const driverResults = [];
                for (let result of results) {
                    const driverAux = yield Drivers_1.default.findByPk(result.getDataValue("resultID"));
                    if (driverAux) {
                        driverResults.push(driverAux);
                    }
                }
                return driverResults;
            case "team":
                const teamResults = [];
                for (let result of results) {
                    const driverAux = yield Drivers_1.default.findByPk(result.getDataValue("resultID"));
                    if (driverAux) {
                        teamResults.push(driverAux);
                    }
                }
                return teamResults;
            case "track":
                const trackResults = [];
                for (let result of results) {
                    const driverAux = yield Drivers_1.default.findByPk(result.getDataValue("resultID"));
                    if (driverAux) {
                        trackResults.push(driverAux);
                    }
                }
                return trackResults;
        }
    });
}
const createImpostorGame = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, date, amount_impostors, amount_innocents, impostors, innocents, type, } = req.body;
        const validated = validateImpostorGame(title, date, amount_impostors, amount_innocents, impostors, innocents, type);
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
                const dateObj = new Date(Date.UTC(parseInt(dateParts[0]), // año
                parseInt(dateParts[1]) - 1, // mes (0-11)
                parseInt(dateParts[2]), // día
                12, 0, 0 // mediodía UTC
                ));
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
        const createdGame = yield associations_1.Impostors.create(impostorGame);
        const gameID = createdGame.getDataValue("id");
        const impostorResults = createImpostorResults(impostors, innocents, type, gameID);
        if (impostorResults.length <= 0) {
            return res.status(500).json({
                message: "Something went wrong by adding impostor results. Please contact support",
            });
        }
        for (let result of impostorResults) {
            yield associations_1.Impostors_Results.create(result);
        }
        return res.status(200).json({
            message: "Impostor game created successfully",
            gameId: gameID,
        });
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.createImpostorGame = createImpostorGame;
function createImpostorResults(impostors, innocents, type, gameID) {
    var _a, _b, _c, _d, _e, _f;
    let impostorResults = [];
    for (let impostor of impostors) {
        switch (type) {
            case "driver":
                const driverResult = {
                    gameID: gameID,
                    resultID: (_a = impostor.driver) === null || _a === void 0 ? void 0 : _a.id,
                    isImpostor: true,
                };
                impostorResults.push(driverResult);
                break;
            case "team":
                const teamResult = {
                    gameID: gameID,
                    resultID: (_b = impostor.team) === null || _b === void 0 ? void 0 : _b.id,
                    isImpostor: true,
                };
                impostorResults.push(teamResult);
                break;
            case "track":
                const trackResult = {
                    gameID: gameID,
                    resultID: (_c = impostor.track) === null || _c === void 0 ? void 0 : _c.id,
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
                    resultID: (_d = innocent.driver) === null || _d === void 0 ? void 0 : _d.id,
                    isImpostor: false,
                };
                impostorResults.push(driverResult);
                break;
            case "team":
                const teamResult = {
                    gameID: gameID,
                    resultID: (_e = innocent.team) === null || _e === void 0 ? void 0 : _e.id,
                    isImpostor: false,
                };
                impostorResults.push(teamResult);
                break;
            case "track":
                const trackResult = {
                    gameID: gameID,
                    resultID: (_f = innocent.track) === null || _f === void 0 ? void 0 : _f.id,
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
function validateImpostorGame(title, date, amount_impostors, amount_innocents, impostors, innocents, type) {
    if (!title ||
        typeof title !== "string" ||
        !date ||
        typeof date !== "string" ||
        !amount_impostors ||
        typeof amount_impostors !== "number" ||
        !amount_innocents ||
        typeof amount_innocents !== "number" ||
        !type ||
        typeof type !== "string") {
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
    if (impostors.length !== amount_impostors ||
        innocents.length !== amount_innocents) {
        console.log(3);
        return false;
    }
    return true;
}
function validateAddImpostor(type, year, fromYear, toYear, nationality, stat, condition, value, isImpostor) {
    if (!type ||
        typeof type !== "string" ||
        !stat ||
        typeof stat !== "string" ||
        !condition ||
        typeof condition !== "string" ||
        !value ||
        typeof value !== "number" ||
        typeof isImpostor !== "boolean") {
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
const findCandidates = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type, year, fromYear, toYear, nationality, stat, condition, value, isImpostor, } = req.body;
        const validated = validateAddImpostor(type, year, fromYear, toYear, nationality, stat, condition, value, isImpostor);
        if (!validated) {
            return res.status(400).json({
                message: "Validation for parameters on adding impostor failed",
            });
        }
        const whereCondition = {};
        if (nationality) {
            whereCondition.nationality = nationality;
        }
        if (year) {
            whereCondition.year = year.toString();
        }
        else if (fromYear && toYear) {
            whereCondition.year = {
                [sequelize_1.Op.between]: [fromYear.toString(), toYear.toString()],
            };
        }
        let impostor = false;
        if (isImpostor && typeof isImpostor === "boolean") {
            impostor = isImpostor;
        }
        switch (type) {
            case "driver":
                const drivers = yield findByDrivers(year, nationality, fromYear, toYear, stat, condition, value, impostor);
                return res.status(200).json(drivers);
            case "team":
                const teams = yield findByTeams(year, fromYear, toYear, stat, condition, value, impostor);
                return res.status(200).json(teams);
            case "track":
                const tracks = yield findByTracks(year, fromYear, toYear, stat, condition, value, impostor, 1);
                return res.status(200).json(tracks);
        }
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.findCandidates = findCandidates;
function findByDrivers(year, nationality, fromYear, toYear, stat, condition, value, isImpostor) {
    return __awaiter(this, void 0, void 0, function* () {
        const operatorMap = {
            ">": "<=",
            "<": ">=",
            "=": "!=",
            ">=": "<",
            "<=": ">",
        };
        const effectiveCondition = isImpostor ? operatorMap[condition] : condition;
        const havingClause = (0, sequelize_1.literal)(`SUM(${stat}) ${effectiveCondition} ${value}`);
        const results = yield associations_1.Season_Teams_Drivers.findAll({
            include: [
                Object.assign({ model: Drivers_1.default, attributes: ["id", "firstname", "lastname", "nationality", "image"] }, (nationality && { where: { nationality } })),
                {
                    model: associations_1.Seasons,
                    attributes: [],
                    where: year
                        ? { year: year.toString() }
                        : fromYear && toYear
                            ? { year: { [sequelize_1.Op.between]: [fromYear.toString(), toYear.toString()] } }
                            : undefined,
                },
            ],
            attributes: ["driverID", [(0, sequelize_1.fn)("SUM", (0, sequelize_1.col)(stat)), "totalStat"]],
            group: ["driverID", "Driver.id"],
            order: [[(0, sequelize_1.literal)("totalStat"), "DESC"]],
            having: havingClause,
        });
        return results
            .map((r) => ({
            driver: r.Driver,
            totalStat: r.getDataValue("totalStat"),
        }))
            .filter((d) => d);
    });
}
function findByTeams(year, fromYear, toYear, stat, condition, value, isImpostor) {
    return __awaiter(this, void 0, void 0, function* () {
        const operatorMap = {
            ">": "<=",
            "<": ">=",
            "=": "!=",
            ">=": "<",
            "<=": ">",
        };
        const effectiveCondition = isImpostor ? operatorMap[condition] : condition;
        const havingClause = (0, sequelize_1.literal)(`SUM(${stat}) ${effectiveCondition} ${value}`);
        const results = yield associations_1.Season_Teams.findAll({
            include: [
                {
                    model: Teams_1.default,
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
                    model: associations_1.Seasons,
                    attributes: [],
                    where: year
                        ? { year: year.toString() }
                        : fromYear && toYear
                            ? { year: { [sequelize_1.Op.between]: [fromYear.toString(), toYear.toString()] } }
                            : undefined,
                },
            ],
            attributes: ["teamID", [(0, sequelize_1.fn)("SUM", (0, sequelize_1.col)(stat)), "totalStat"]],
            group: ["teamID", "Team.id"],
            order: [[(0, sequelize_1.literal)("totalStat"), "DESC"]],
            having: havingClause,
        });
        return results
            .map((r) => ({
            team: r.Team,
            totalStat: r.getDataValue("totalStat"),
        }))
            .filter((d) => d);
    });
}
function findByTracks(year, fromYear, toYear, stat, condition, value, isImpostor, length) {
    return __awaiter(this, void 0, void 0, function* () {
        const operatorMap = {
            ">": "<=",
            "<": ">=",
            "=": "!=",
            ">=": "<",
            "<=": ">",
        };
        const effectiveCondition = isImpostor ? operatorMap[condition] : condition;
        const havingClause = (0, sequelize_1.literal)(`SUM(${stat}) ${effectiveCondition} ${value}`);
        const results = yield associations_1.Season_Tracks.findAll({
            include: [
                {
                    model: associations_1.Tracks,
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
                    model: associations_1.Seasons,
                    attributes: [],
                    where: year
                        ? { year: year.toString() }
                        : fromYear && toYear
                            ? { year: { [sequelize_1.Op.between]: [fromYear.toString(), toYear.toString()] } }
                            : undefined,
                },
            ],
            attributes: ["teamID", [(0, sequelize_1.fn)("SUM", (0, sequelize_1.col)(stat)), "totalStat"]],
            group: ["teamID", "Team.id"],
            order: [[(0, sequelize_1.literal)("totalStat"), "DESC"]],
            having: havingClause,
        });
        return results
            .map((r) => ({
            track: r.Track,
            totalStat: r.getDataValue("totalStat"),
        }))
            .filter((d) => d);
    });
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
function getNextApiKey() {
    const key = REMOVE_BG_API_KEYS[currentKeyIndex];
    currentKeyIndex = (currentKeyIndex + 1) % REMOVE_BG_API_KEYS.length;
    return key;
}
// Función que utiliza la API de remove.bg para eliminar el fondo
function removeBackground(file) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const formData = new form_data_1.default();
        formData.append("image_file", file.buffer, { filename: file.originalname });
        formData.append("size", "auto");
        // Intentar hasta 3 veces con diferentes API keys si hay error
        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                const apiKey = getNextApiKey();
                console.log(`Intento ${attempt + 1} con API key: ${apiKey.substring(0, 5)}...`);
                const response = yield axios_1.default.post("https://api.remove.bg/v1.0/removebg", formData, {
                    headers: Object.assign({ "X-Api-Key": apiKey }, formData.getHeaders()),
                    responseType: "arraybuffer", // Devuelve la imagen en binario
                });
                // Verificar si la respuesta es un error (a veces viene como JSON)
                if ((_a = response.headers["content-type"]) === null || _a === void 0 ? void 0 : _a.includes("application/json")) {
                    const errorText = Buffer.from(response.data).toString("utf8");
                    if (errorText.includes("error")) {
                        console.log(`Error en API: ${errorText}`);
                        continue; // Probar con la siguiente API key
                    }
                }
                return Buffer.from(response.data); // Retorna la imagen procesada como buffer
            }
            catch (error) {
                console.error(`Error con API key ${attempt + 1}:`, error.message);
                // Si es el último intento, fallar
                if (attempt === 2) {
                    console.error("Todos los intentos fallaron. Usando procesamiento local como respaldo.");
                    // Usar Sharp como respaldo
                    try {
                        const sharp = require("sharp");
                        return yield sharp(file.buffer)
                            .png()
                            .trim()
                            .resize({
                            width: 800,
                            height: 800,
                            fit: "inside",
                            withoutEnlargement: true,
                        })
                            .toBuffer();
                    }
                    catch (sharpError) {
                        console.error("Error con procesamiento local:", sharpError);
                        return null;
                    }
                }
            }
        }
        return null;
    });
}
const postImage = (file, originalName) => {
    if (!file)
        return undefined;
    // Asegurarse de que la carpeta de destino existe
    const uploadDir = path_1.default.join("uploads/drivers");
    if (!fs_1.default.existsSync(uploadDir)) {
        fs_1.default.mkdirSync(uploadDir, { recursive: true });
    }
    // Generar un nombre de archivo consistente
    const fileName = originalName || `image_${Date.now()}.png`;
    const uploadPath = path_1.default.join(uploadDir, fileName);
    try {
        // Si `file` es un Buffer (imagen procesada), lo guarda como un archivo
        if (file instanceof Buffer) {
            fs_1.default.writeFileSync(uploadPath, file);
        }
        else {
            // Si es un archivo Multer, guarda el buffer
            fs_1.default.writeFileSync(uploadPath, file.buffer);
        }
        console.log(`Imagen guardada exitosamente en: ${uploadPath}`);
        return uploadPath;
    }
    catch (error) {
        console.error(`Error guardando la imagen en ${uploadPath}:`, error);
        return undefined;
    }
};
exports.postImage = postImage;
