import { Router } from "express";
import {
  createH2HGame,
  deleteH2HGame,
  getAllH2HGames,
  getH2HGameById,
  updateH2HGame,
} from "../controllers/H2HGames";

const router = Router();

// Rutas para H2H Games
router.get("/", getAllH2HGames);
router.get("/:id", getH2HGameById);
router.post("/", createH2HGame);
router.put("/:id", updateH2HGame);
router.delete("/:id", deleteH2HGame);

export default router;
