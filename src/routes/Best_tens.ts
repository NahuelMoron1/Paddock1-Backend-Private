import { Router } from "express";
import {
  createBest10Game,
  createBest10GameManual,
  getGameData,
  getSuggestions,
  playBest10Game,
  surrenderBest10Game,
  updateBest10GameResults,
} from "../controllers/Best_tens";

const router = Router();

router.post("/create", createBest10Game);
router.post("/create/manual", createBest10GameManual);
router.get("/play/:input/:type/:gameID", playBest10Game);
router.get("/gamedata", getGameData);
router.get("/update", updateBest10GameResults);
router.get("/suggestions/:input/:type", getSuggestions);
router.get("/giveup/:gameID/:type", surrenderBest10Game);
export default router;
