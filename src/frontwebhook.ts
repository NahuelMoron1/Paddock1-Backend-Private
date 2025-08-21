import express from "express";
import { exec } from "child_process";

const router = express.Router();

router.post("/front/github-webhook", (req, res) => {
  // Opcional: validar el secret si lo pusiste en GitHub
  console.log("Webhook recibido de GitHub");

  exec(
    "cd /home/safe365fe/htdocs/www.safe-365.online/Safe365-Builder && git pull origin main",
    (err, stdout, stderr) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error ejecutando deploy");
      }
      console.log(stdout);
      res.send("Deploy realizado correctamente");
    }
  );
});

export default router;
