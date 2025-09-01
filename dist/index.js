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
const dotenv_1 = __importDefault(require("dotenv"));
const server_1 = __importDefault(require("./models/server"));
const { execSync } = require("child_process");
const fetch = require("node-fetch");
require("dotenv").config();
dotenv_1.default.config();
const server = new server_1.default();
const axios_1 = __importDefault(require("axios"));
const config_1 = require("./models/config");
function notifySlack(text) {
    axios_1.default
        .post(config_1.SLACK_WEBHOOK_URL, { text })
        .catch((err) => console.error("Error enviando mensaje a Slack:", err));
}
function slackStatus() {
    (() => __awaiter(this, void 0, void 0, function* () {
        try {
            // Le saco los colores con --no-color
            const status = execSync("pm2 status --no-color", { encoding: "utf8" });
            yield fetch(config_1.SLACK_WEBHOOK_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: `🚀 Servidor reiniciado\n\`\`\`\n${status}\n\`\`\``,
                }),
            });
            console.log("Notificación enviada a Slack");
        }
        catch (error) {
            console.error("Error enviando a Slack:", error);
        }
    }))();
}
// Apenas arranca el backend
if (config_1.PRODUCTION) {
    /*notifySlack(
      "✅ Server *mi-backend* just got restarted and it's working as expected."
    );*/
    slackStatus();
}
