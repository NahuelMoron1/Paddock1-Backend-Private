import dotenv from "dotenv";
import Server from "./models/server";
require("dotenv").config();
dotenv.config();
const server = new Server();

import axios from "axios";
import { PRODUCTION, SLACK_WEBHOOK_URL } from "./models/config";

function notifySlack(text: string) {
  axios
    .post(SLACK_WEBHOOK_URL, { text })
    .catch((err) => console.error("Error enviando mensaje a Slack:", err));
}

// Apenas arranca el backend
if (PRODUCTION) {
  notifySlack(
    "✅ Server *mi-backend* just got restarted and it's working as expected."
  );
}
