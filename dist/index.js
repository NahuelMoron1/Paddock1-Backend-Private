"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const server_1 = __importDefault(require("./models/server"));
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
// Apenas arranca el backend
if (config_1.PRODUCTION) {
    notifySlack("✅ Server *mi-backend* just got restarted and it's working as expected.");
}
