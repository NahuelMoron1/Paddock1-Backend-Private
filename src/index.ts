import dotenv from "dotenv";
import Server from "./models/server";
const { execSync } = require("child_process");
const fetch = require("node-fetch");

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

function slackStatus() {
  (async () => {
    try {
      // Le saco los colores con --no-color
      const status = execSync("pm2 status --no-color", { encoding: "utf8" });

      await fetch(SLACK_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `🚀 Servidor reiniciado\n\`\`\`\n${status}\n\`\`\``,
        }),
      });

      console.log("Notificación enviada a Slack");
    } catch (error) {
      console.error("Error enviando a Slack:", error);
    }
  })();
}

// Apenas arranca el backend
if (PRODUCTION) {
  /*notifySlack(
    "✅ Server *mi-backend* just got restarted and it's working as expected."
  );*/

  slackStatus();
}
