import { Router } from "express";
import upload from "../middlewares/multer";

import {
  createImpostorGame,
  findCandidates,
  getGameData,
  playNormalGame,
  removeBackgroundForImages,
} from "../controllers/Impostors";

const router = Router();
router.post("/candidates", findCandidates);
router.post("/create", createImpostorGame);
router.post("/play/normal", playNormalGame);
router.get("/gamedata", getGameData);
router.post("/files", upload.single("file"), removeBackgroundForImages);
export default router;
