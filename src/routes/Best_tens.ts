import { Router } from "express";
import {
  createBest10Game,
  createBest10GameManual,
  getGameData,
  getSuggestions,
  updateBest10GameResults,
} from "../controllers/Best_tens";

const router = Router();

router.post("/create/automatic", createBest10Game);
router.post("/create/manual", createBest10GameManual);
router.get("/gamedata", getGameData);
router.get("/update", updateBest10GameResults);
router.get("/suggestions/:input/:type", getSuggestions);
export default router;
