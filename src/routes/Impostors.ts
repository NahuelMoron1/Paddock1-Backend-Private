import { Router } from "express";
import upload from "../middlewares/multer";

import {
  createImpostorGame,
  findCandidates,
  getAllImpostorGames,
  getGameById,
  getGameData,
  playNormalGame,
  removeBackgroundForImages,
  updateGame,
} from "../controllers/Impostors";

const router = Router();
router.post("/candidates", findCandidates);
router.post("/create", createImpostorGame);
router.post("/play/normal", playNormalGame);
router.get("/gamedata", getGameData);
router.get("/files", removeBackgroundForImages);

// Nuevas rutas para la gestión de juegos
router.get("/games", getAllImpostorGames);
router.get("/game/:id", getGameById);
router.put("/update/:id", updateGame);

export default router;
