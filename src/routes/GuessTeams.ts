import { Router } from "express";
import { createGuessTeamGame } from "../controllers/GuessTeams";

const router = Router();

router.post("/", createGuessTeamGame);
export default router;
