import { Router } from "express";
import {
  createGuessTeamGame,
  deleteGuessTeam,
  getAllGuessTeams,
  getGuessTeamByID,
  updateGuessTeam,
} from "../controllers/GuessTeams";

const router = Router();

router.post("/", createGuessTeamGame);
router.get("/all", getAllGuessTeams);
router.get("/:gameID", getGuessTeamByID);
router.post("/update/:gameID", updateGuessTeam);
router.delete("/delete/:gameID", deleteGuessTeam);

export default router;
