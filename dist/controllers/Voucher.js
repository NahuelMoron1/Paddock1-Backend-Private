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
exports.getFileMysql = exports.getFiles = exports.uploadFile = exports.uploads = void 0;
const multer_1 = __importDefault(require("multer"));
const Voucher_1 = __importDefault(require("../models/mysql/Voucher"));
const fs_1 = __importDefault(require("fs"));
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = (0, multer_1.default)({ storage: storage });
exports.uploads = upload.single('file');
const uploadFile = (req, res) => {
    res.send({ data: req.file.filename });
};
exports.uploadFile = uploadFile;
const getFiles = (req, res) => {
    const directoryPath = 'uploads';
    fs_1.default.readdir(directoryPath, (err, files) => {
        if (err) {
            return res.status(500).send('Unable to scan files');
        }
        console.log(files);
        res.json(files);
    });
};
exports.getFiles = getFiles;
const getFileMysql = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { orderID } = req.params;
    const fileAux = yield Voucher_1.default.findOne({ where: { orderID: orderID } });
    if (fileAux) {
        res.json(fileAux);
    }
    else {
        res.status(404).json({ message: 'Error, File not found' });
    }
});
exports.getFileMysql = getFileMysql;
