"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const child_process_1 = require("child_process");
const router = express_1.default.Router();
router.post("/github-webhook", (req, res) => {
    // Opcional: validar el secret si lo pusiste en GitHub
    console.log("FE Webhook recibido de GitHub");
    (0, child_process_1.exec)("cd /home/safe365fe/htdocs/www.safe-365.online && git pull origin main", (err, stdout, stderr) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error ejecutando FE deploy");
        }
        console.log(stdout);
        res.send("FE Deploy realizado correctamente");
    });
});
exports.default = router;
