import { Router } from "express";
import {
  addSeason_teams,
  createSeason,
  deleteSeason_team,
  getAllSeason_teams,
  modifySeason_teams,
} from "../controllers/Seasons.Teams";

const router = Router();

router.get("/season_teams", getAllSeason_teams);
router.post("/add/season_teams", addSeason_teams);
router.post("/modify/season_track", modifySeason_teams);
router.delete("/delete/season_track", deleteSeason_team);
router.get("/create", createSeason);

export default router;
