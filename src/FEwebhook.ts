import express from "express";
import { exec } from "child_process";
import {
  GITHUB_TOKEN,
  GITHUB_USERNAME,
  SSH_IP,
  SSH_PASSWORD,
} from "./models/config";

const router = express.Router();

router.post("/github-webhook", (req, res) => {
  // Opcional: validar el secret si lo pusiste en GitHub
  console.log("FE Webhook recibido de GitHub");

  // Comando para acceder al sitio estático desde el servidor backend
  // Usamos un script con expect para manejar la autenticación SSH
  const gitCommand = `./src/fe_deploy.sh pdk1gameprivate ${SSH_IP} "${SSH_PASSWORD}" ${GITHUB_USERNAME} ${GITHUB_TOKEN}`;

  // Agregamos timeout para evitar que el proceso se cuelgue
  const child = exec(gitCommand, { timeout: 60000 }, (err, stdout, stderr) => {
    if (stderr) console.log("STDERR:", stderr);

    if (err) {
      console.error("Error ejecutando FE deploy:", err);
      return res.status(500).send("Error ejecutando FE deploy: " + err.message);
    }

    if (stdout.includes("FE Deploy realizado correctamente")) {
      console.log("FE Deploy realizado correctamente");
      res.send("FE Deploy realizado correctamente");
    } else {
      console.error("Deploy no completado correctamente:", stdout);
      res.status(500).send("Deploy no completado correctamente");
    }
  });

  // Manejo adicional de timeout
  child.on("exit", (code, signal) => {
    if (signal === "SIGTERM") {
      res.status(500).send("Timeout en FE deploy");
    }
  });
});

export default router;
