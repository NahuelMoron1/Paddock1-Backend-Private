import dotenv from "dotenv";
import Server from "./models/server";
const { execSync } = require("child_process");

require("dotenv").config();
dotenv.config();
const server = new Server();

import { PRODUCTION, SLACK_BACKEND_STATUS } from "./models/config";

function slackStatus() {
  (async () => {
    try {
      // Saco la lista en JSON
      const raw = execSync("pm2 jlist", { encoding: "utf8" });
      const apps = JSON.parse(raw);

      // Armo un mensaje limpio
      let message = "🚀 *Private pdk1GamePrivate Server restarted*\n\n";
      apps.forEach((app: any) => {
        const name = app.name;
        const status = app.pm2_env.status;
        const uptime = Math.floor((Date.now() - app.pm2_env.pm_uptime) / 1000);
        const cpu = app.monit.cpu;
        const mem = (app.monit.memory / 1024 / 1024).toFixed(1) + " MB";

        let statusIcon = "⚪️";
        if (status === "online") statusIcon = "🟢";
        else if (status === "errored" || status === "stopped")
          statusIcon = "🔴";
        else if (status === "launching") statusIcon = "🟡";

        message += `*App:* ${name}\n`;
        message += `• Status: ${statusIcon} ${status}\n`;
        message += `• Uptime: ${uptime}s\n`;
        message += `• CPU: ${cpu}%\n`;
        message += `• Memoria: ${mem}\n\n`;
      });

      // Envío a Slack
      await fetch(SLACK_BACKEND_STATUS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: message }),
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
