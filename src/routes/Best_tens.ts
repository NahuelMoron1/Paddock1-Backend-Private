import { Router } from "express";
import {
  createBest10Game,
  createBest10GameManual,
  deleteGame,
  getAllGames,
  getGameById,
  getGameData,
  getSuggestions,
  updateBest10GameResults,
  updateGame,
} from "../controllers/Best_tens";

const router = Router();

router.get("/all", getAllGames);
router.get("/:gameID", getGameById);
router.put("/:gameID", updateGame);
router.delete("/:gameID", deleteGame);
router.post("/create/automatic", createBest10Game);
router.post("/create/manual", createBest10GameManual);
router.get("/gamedata", getGameData);
router.get("/update", updateBest10GameResults);
router.get("/suggestions/:input/:type", getSuggestions);
export default router;
