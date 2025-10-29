import { Router } from "express";
import {
  createBest10Game,
  getBest10Game,
  getGameData,
  getSuggestions,
  playBest10Game,
  surrenderBest10Game,
} from "../controllers/Best_tens";

const router = Router();

router.post("/create", createBest10Game);
router.get("/play/:input/:type/:gameID", playBest10Game);
router.get("/gamedata", getGameData);
router.get("/update", getBest10Game);
router.get("/suggestions/:input/:type", getSuggestions);
router.get("/giveup/:gameID/:type", surrenderBest10Game);
export default router;
