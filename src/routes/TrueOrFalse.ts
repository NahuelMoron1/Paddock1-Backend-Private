import { Router } from "express";
import {
  createTrueOrFalseGame,
  deleteTrueOrFalseGame,
  getAllTrueOrFalseGames,
  getGameById,
  updateTrueOrFalseGame,
} from "../controllers/TrueOrFalse";

const router = Router();

// Rutas para True or False Games
router.get("/", getAllTrueOrFalseGames);
router.get("/:id", getGameById);
router.post("/", createTrueOrFalseGame);
router.put("/:id", updateTrueOrFalseGame);
router.delete("/:id", deleteTrueOrFalseGame);

export default router;
