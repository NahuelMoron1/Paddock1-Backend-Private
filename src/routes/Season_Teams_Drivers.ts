import { Router } from "express";
import {
  createSeason,
  getAllSeason_Teams_Drivers,
  getBySeason_Teams_Drivers,
} from "../controllers/Season_Teams_Drivers";

const router = Router();

router.get("/all", getAllSeason_Teams_Drivers);
router.get("/year/:year", getBySeason_Teams_Drivers);
router.get("/create", createSeason);

export default router;
