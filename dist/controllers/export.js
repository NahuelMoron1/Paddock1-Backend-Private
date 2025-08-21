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
exports.exportTables = void 0;
const config_1 = require("../models/config");
const mysqldump_1 = __importDefault(require("mysqldump"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const exportTables = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { type } = req.params; // Se obtiene el tipo de exportación desde el body
    if (!type || type === "") {
        return res.status(403).json({ message: "Error, Failed to parse" });
    }
    let nombreArchivo = "";
    const backupDir = path_1.default.resolve(__dirname, "../../backups"); // Ir 2 niveles arriba
    let filePath;
    const tablas = [];
    const date = new Date();
    const formattedDate = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
    // Selección de tablas según el tipo recibido
    switch (type) {
        case "Products":
            nombreArchivo = `backup_Productos_${formattedDate}.sql`;
            filePath = path_1.default.join(backupDir, nombreArchivo);
            tablas.push("Products", "Options");
            break;
        case "Brands":
            nombreArchivo = `backup_Marcas_${formattedDate}.sql`;
            filePath = path_1.default.join(backupDir, nombreArchivo);
            tablas.push("Brands");
            break;
        case "Categories":
            nombreArchivo = `backup_Categorias_${formattedDate}.sql`;
            filePath = path_1.default.join(backupDir, nombreArchivo);
            tablas.push("Categories");
            break;
        case "all":
            nombreArchivo = `backup_Todos_${formattedDate}.sql`;
            filePath = path_1.default.join(backupDir, nombreArchivo);
            tablas.push("Products", "Options", "Brands", "Categories");
            break;
        default:
            return res.status(400).json({ message: "Tipo inválido" });
    }
    try {
        // Generar el dump con las tablas seleccionadas
        yield (0, mysqldump_1.default)({
            connection: {
                host: config_1.DB_HOST,
                user: config_1.DB_USER,
                password: config_1.DB_PASSWORD,
                database: config_1.DB_NAME,
            },
            dump: {
                tables: tablas, // Especifica las tablas a exportar
            },
            dumpToFile: filePath, // Guarda el archivo en el servidor
        });
        // Reemplazar 'INSERT INTO' por 'INSERT IGNORE INTO'
        let sqlDump = fs_1.default.readFileSync(filePath, "utf8");
        sqlDump = sqlDump.replace(/INSERT INTO/gi, "INSERT IGNORE INTO"); // Reemplazo global
        // Guardar el archivo corregido
        fs_1.default.writeFileSync(filePath, sqlDump, "utf8");
        const urlToDownload = `backups/${nombreArchivo}`;
        res.json(urlToDownload);
    }
    catch (error) {
        console.error("Error al exportar las tablas:", error);
        res.status(500).json({ error: "Error al exportar la base de datos" });
    }
});
exports.exportTables = exportTables;
