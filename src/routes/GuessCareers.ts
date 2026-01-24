import { Router } from "express";
import {
  createGuessCareersGame,
  deleteGame,
  getAllGuessCareersGames,
  getGameById,
  updateGame,
} from "../controllers/GuessCareers";

const router = Router();

// Rutas para GuessCareers
router.get("/", getAllGuessCareersGames);
router.get("/:id", getGameById);
router.post("/", createGuessCareersGame);
router.put("/:id", updateGame);
router.delete("/:id", deleteGame);

export default router;